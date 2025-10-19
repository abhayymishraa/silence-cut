import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "~/server/db";
import { payments, workspaces } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log("Checkout session completed:", session.id);
        console.log("Metadata:", session.metadata);

        // Get workspace ID from metadata
        const workspaceId = session.metadata?.workspaceId;
        
        if (!workspaceId) {
          console.error("No workspaceId in session metadata");
          return NextResponse.json(
            { error: "Missing workspaceId in metadata" },
            { status: 400 }
          );
        }

        // Update payment record
        const payment = await db.query.payments.findFirst({
          where: eq(payments.stripeSessionId, session.id),
        });

        if (payment) {
          // Update payment status
          await db
            .update(payments)
            .set({
              status: "completed",
              updatedAt: new Date(),
            })
            .where(eq(payments.id, payment.id));

          // Add credits to workspace
          const workspace = await db.query.workspaces.findFirst({
            where: eq(workspaces.id, workspaceId),
          });

          if (workspace) {
            const newCredits = workspace.credits + payment.credits;
            await db
              .update(workspaces)
              .set({
                credits: newCredits,
                updatedAt: new Date(),
              })
              .where(eq(workspaces.id, workspaceId));

            console.log(
              `Added ${payment.credits} credits to workspace ${workspaceId}. New balance: ${newCredits}`
            );
          } else {
            console.error(`Workspace not found: ${workspaceId}`);
          }
        } else {
          console.error(`Payment record not found for session: ${session.id}`);
        }

        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Async payment succeeded:", session.id);
        // Handle async payment success (e.g., bank transfers)
        // Same logic as checkout.session.completed
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Async payment failed:", session.id);
        
        // Update payment status to failed
        await db
          .update(payments)
          .set({
            status: "failed",
            updatedAt: new Date(),
          })
          .where(eq(payments.stripeSessionId, session.id));

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}