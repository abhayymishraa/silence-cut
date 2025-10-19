import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { workspaces, memberships } from "~/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const workspaceRouter = createTRPCRouter({
  // Get current workspace info
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = ctx.headers.get("x-workspace-id");
    if (!workspaceId) {
      throw new Error("Workspace not found");
    }

    const workspace = await ctx.db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return workspace;
  }),

  // Update workspace settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        primaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).optional(),
        logoUrl: z.string().url().optional(),
        customDomain: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.headers.get("x-workspace-id");
      if (!workspaceId) {
        throw new Error("Workspace not found");
      }

      // Check if user has permission to update workspace
      const membership = await ctx.db.query.memberships.findFirst({
        where: and(
          eq(memberships.userId, ctx.session.user.id),
          eq(memberships.workspaceId, workspaceId)
        ),
      });

      if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new Error("Insufficient permissions");
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (input.name) {
        updateData.name = input.name;
      }

      if (input.primaryColor) {
        updateData.primaryColor = input.primaryColor;
      }

      if (input.logoUrl) {
        updateData.logoUrl = input.logoUrl;
      }

      if (input.customDomain !== undefined) {
        updateData.customDomain = input.customDomain || null;
      }

      const [updatedWorkspace] = await ctx.db
        .update(workspaces)
        .set(updateData)
        .where(eq(workspaces.id, workspaceId))
        .returning();

      return updatedWorkspace;
    }),

  // Get workspace credits
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = ctx.headers.get("x-workspace-id");

    // In dev or if header missing, fall back to default slug
    let workspace = null as { credits: number } | null;

    if (workspaceId && workspaceId !== "default") {
      workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
        columns: { credits: true },
      });
    }

    if (!workspace) {
      workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.slug, "default"),
        columns: { credits: true },
      });
    }

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return { credits: workspace.credits };
  }),

  // Deduct credits (for internal use)
  deductCredits: protectedProcedure
    .input(z.object({ amount: z.number().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.headers.get("x-workspace-id");
      if (!workspaceId) {
        throw new Error("Workspace not found");
      }

      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
      });

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      if (workspace.credits < input.amount) {
        throw new Error("Insufficient credits");
      }

      const [updatedWorkspace] = await ctx.db
        .update(workspaces)
        .set({
          credits: workspace.credits - input.amount,
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, workspaceId))
        .returning();

      if (!updatedWorkspace) {
        throw new Error("Failed to update workspace credits");
      }

      return { credits: updatedWorkspace.credits };
    }),

  // List user's workspaces
  listUserWorkspaces: protectedProcedure.query(async ({ ctx }) => {
    const userWorkspaces = await ctx.db.query.memberships.findMany({
      where: eq(memberships.userId, ctx.session.user.id),
      with: {
        workspace: true,
      },
      orderBy: [desc(memberships.createdAt)],
    });

    return userWorkspaces.map((membership) => ({
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      logoUrl: membership.workspace.logoUrl,
      primaryColor: membership.workspace.primaryColor,
      credits: membership.workspace.credits,
      role: membership.role,
      createdAt: membership.createdAt,
    }));
  }),

  // Create new workspace
  createWorkspace: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
        primaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).optional(),
        logoUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if slug is already taken
      const existingWorkspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.slug, input.slug),
      });

      if (existingWorkspace) {
        throw new Error("Workspace slug already exists");
      }

      // Create workspace
      const [newWorkspace] = await ctx.db
        .insert(workspaces)
        .values({
          name: input.name,
          slug: input.slug,
          primaryColor: input.primaryColor || "#3b82f6",
          logoUrl: input.logoUrl,
          credits: 1, // Start with 1 free credit
        })
        .returning();

      // Create membership for the creator as owner
      await ctx.db.insert(memberships).values({
        userId: ctx.session.user.id,
        workspaceId: newWorkspace.id,
        role: "owner",
      });

      return {
        id: newWorkspace.id,
        name: newWorkspace.name,
        slug: newWorkspace.slug,
        logoUrl: newWorkspace.logoUrl,
        primaryColor: newWorkspace.primaryColor,
        credits: newWorkspace.credits,
        role: "owner",
        createdAt: newWorkspace.createdAt,
      };
    }),

  // Switch to a different workspace
  switchWorkspace: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this workspace
      const membership = await ctx.db.query.memberships.findFirst({
        where: and(
          eq(memberships.userId, ctx.session.user.id),
          eq(memberships.workspaceId, input.workspaceId)
        ),
        with: {
          workspace: true,
        },
      });

      if (!membership) {
        throw new Error("You don't have access to this workspace");
      }

      return {
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
        logoUrl: membership.workspace.logoUrl,
        primaryColor: membership.workspace.primaryColor,
        credits: membership.workspace.credits,
        role: membership.role,
      };
    }),
});
