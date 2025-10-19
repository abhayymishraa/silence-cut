import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { workspaces, payments } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    })
  : null;

export const paymentRouter = createTRPCRouter({
  // Create Stripe checkout session
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.headers.get("x-workspace-id");
      if (!workspaceId) {
        throw new Error("Workspace not found");
      }

      if (!stripe) {
        throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.");
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Video Processing Credits",
                description: "100 credits for video silence removal",
              },
              unit_amount: 4900, // $49.00
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=cancelled`,
        metadata: {
          workspaceId,
          userId: ctx.session.user.id,
        },
      });

      // Store payment record
      await ctx.db.insert(payments).values({
        workspaceId,
        stripeSessionId: session.id!,
        amount: 4900,
        credits: 100,
        status: "pending",
      });

      return { url: session.url };
    }),

  // Get payment history
  getPayments: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = ctx.headers.get("x-workspace-id");
    if (!workspaceId) {
      throw new Error("Workspace not found");
    }

    return await ctx.db.query.payments.findMany({
      where: eq(payments.workspaceId, workspaceId),
      orderBy: [payments.createdAt],
    });
  }),

  // Add credits (for webhook use)
  addCredits: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        credits: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, input.workspaceId),
      });

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      const [updatedWorkspace] = await ctx.db
        .update(workspaces)
        .set({
          credits: workspace.credits + input.credits,
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, input.workspaceId))
        .returning();

      if (!updatedWorkspace) {
        throw new Error("Failed to update workspace credits");
      }

      return { credits: updatedWorkspace.credits };
    }),
});
