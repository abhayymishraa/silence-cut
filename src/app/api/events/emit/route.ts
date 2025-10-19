import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { videoJobs } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { globalEventEmitter } from "~/lib/eventEmitter";

export const dynamic = "force-dynamic";

// This is a simple event emitter that can be called by the worker
// to notify clients about job status changes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, status, secret } = body;

    // Basic security check - require a secret
    // In production, use a proper API key or JWT
    const webhookSecret = process.env.WORKER_WEBHOOK_SECRET || 'dev-secret';
    if (secret !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!jobId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the job from the database
    const job = await db.query.videoJobs.findFirst({
      where: eq(videoJobs.id, jobId),
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Emit the event to all connected SSE clients
    const eventData = {
      type: "job_update",
      job: {
        id: job.id,
        status: job.status,
        workspaceId: job.workspaceId,
        userId: job.userId,
        originalUrl: job.originalUrl,
        processedUrl: job.processedUrl,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      },
    };

    globalEventEmitter.emit("job_update", eventData);
    
    console.log(`📡 Emitted job_update event for job ${jobId} with status ${status}`);
    console.log(`   Active SSE listeners: ${globalEventEmitter.listenerCount("job_update")}`);

    // Return success
    return NextResponse.json({
      success: true,
      message: `Event emitted for job ${jobId} with status ${status}`,
      listeners: globalEventEmitter.listenerCount("job_update"),
    });
  } catch (error) {
    console.error("Error emitting event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
