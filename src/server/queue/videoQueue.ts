import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const connection = process.env.REDIS_URL 
  ? new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  : null;

export const videoQueue = connection 
  ? new Queue("video-processing", {
      connection,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    })
  : null;

export interface VideoJobData {
  jobId: string;
  filePath: string;
  workspaceId: string;
  userId: string;
}

export async function enqueueVideoJob(data: VideoJobData) {
  if (!videoQueue) {
    console.warn("Redis not configured. Video job will not be processed.");
    return null;
  }
  
  return await videoQueue.add("process-video", data, {
    jobId: data.jobId,
  });
}
