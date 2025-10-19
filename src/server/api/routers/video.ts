import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { videoJobs, workspaces } from "~/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { enqueueVideoJob } from "~/server/queue/videoQueue";

export const videoRouter = createTRPCRouter({
  // Get all video jobs for the current workspace
  getJobs: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = ctx.headers.get("x-workspace-id");
    if (!workspaceId) {
      throw new Error("Workspace not found");
    }

    return await ctx.db.query.videoJobs.findMany({
      where: eq(videoJobs.workspaceId, workspaceId),
      orderBy: [desc(videoJobs.createdAt)],
      limit: 50,
    });
  }),

  // Get a specific video job
  getJob: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspaceId = ctx.headers.get("x-workspace-id");
      if (!workspaceId) {
        throw new Error("Workspace not found");
      }

      const job = await ctx.db.query.videoJobs.findFirst({
        where: and(
          eq(videoJobs.id, input.id),
          eq(videoJobs.workspaceId, workspaceId)
        ),
      });

      if (!job) {
        throw new Error("Video job not found");
      }

      return job;
    }),

  // Create a new video job
  createJob: protectedProcedure
    .input(
      z.object({
        originalUrl: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.headers.get("x-workspace-id");
      if (!workspaceId) {
        throw new Error("Workspace not found");
      }

      // Check if workspace has credits
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
      });

      if (!workspace || workspace.credits <= 0) {
        throw new Error("Insufficient credits. Please upgrade your plan.");
      }

      // Create video job
      const [job] = await ctx.db
        .insert(videoJobs)
        .values({
          workspaceId,
          userId: ctx.session.user.id,
          originalUrl: input.originalUrl,
          status: "queued",
        })
        .returning();

      if (!job) {
        throw new Error("Failed to create video job");
      }

      // Deduct 1 credit from workspace
      await ctx.db
        .update(workspaces)
        .set({
          credits: workspace.credits - 1,
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, workspaceId));

      // Enqueue job for processing
      const queueResult = await enqueueVideoJob({
        jobId: job.id,
        filePath: input.originalUrl,
        workspaceId,
        userId: ctx.session.user.id,
      });

      if (!queueResult) {
        // If Redis is not available, mark job as failed
        await ctx.db
          .update(videoJobs)
          .set({
            status: "failed",
            errorMessage: "Redis not configured. Video processing unavailable.",
            completedAt: new Date(),
          })
          .where(eq(videoJobs.id, job.id));
        
        // Refund the credit since job failed immediately
        await ctx.db
          .update(workspaces)
          .set({
            credits: workspace.credits,
            updatedAt: new Date(),
          })
          .where(eq(workspaces.id, workspaceId));
      }

      return job;
    }),

  // Update job status (for internal use)
  updateJobStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["queued", "processing", "completed", "failed"]),
        processedUrl: z.string().optional(),
        duration: z.number().optional(),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.headers.get("x-workspace-id");
      if (!workspaceId) {
        throw new Error("Workspace not found");
      }

      const updateData: any = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.processedUrl) {
        updateData.processedUrl = input.processedUrl;
      }

      if (input.duration) {
        updateData.duration = input.duration;
      }

      if (input.errorMessage) {
        updateData.errorMessage = input.errorMessage;
      }

      if (input.status === "completed" || input.status === "failed") {
        updateData.completedAt = new Date();
      }

      const [updatedJob] = await ctx.db
        .update(videoJobs)
        .set(updateData)
        .where(
          and(
            eq(videoJobs.id, input.id),
            eq(videoJobs.workspaceId, workspaceId)
          )
        )
        .returning();

      return updatedJob;
    }),

  // Delete a video job
  deleteJob: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.headers.get("x-workspace-id");
      if (!workspaceId) {
        throw new Error("Workspace not found");
      }

      await ctx.db
        .delete(videoJobs)
        .where(
          and(
            eq(videoJobs.id, input.id),
            eq(videoJobs.workspaceId, workspaceId)
          )
        );

      return { success: true };
    }),
});
