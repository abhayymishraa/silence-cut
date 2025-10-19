import { Worker } from "bullmq";
import IORedis from "ioredis";
import { processVideo } from "./videoProcessor.js";
import type { VideoJobData } from "./videoProcessor.js";

console.log("Starting video processing worker...");

// Connect to Redis
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
console.log(`Connecting to Redis at: ${redisUrl}`);
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Create worker
const worker = new Worker(
  "video-processing",
  async (job) => {
    console.log(`Processing job ${job.id}...`);
    const data = job.data as VideoJobData;
    await processVideo(data);
    return { success: true };
  },
  { connection }
);

// Handle events
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

console.log("Worker started and waiting for jobs...");

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Worker shutting down...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Worker shutting down...");
  await worker.close();
  process.exit(0);
});
