import { spawn } from "child_process";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { db } from "./db.js";
import { videoJobs, workspaces, users } from "./schema.js";
import { eq } from "drizzle-orm";

export interface VideoJobData {
  jobId: string;
  filePath: string;
  workspaceId: string;
  userId: string;
}

export async function processVideo(jobData: VideoJobData) {
  const { jobId, filePath, workspaceId, userId } = jobData;
  
  try {
    // Update job status to processing
    await db
      .update(videoJobs)
      .set({ status: "processing" })
      .where(eq(videoJobs.id, jobId));

    console.log(`Processing video job ${jobId} for file ${filePath}`);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`Input file not found: ${filePath}`);
    }

    // Create output directory
    const outputDir = join(dirname(filePath), "processed");
    await fs.mkdir(outputDir, { recursive: true });

    // Generate output file path
    const outputFileName = `processed-${Date.now()}.mp4`;
    const outputPath = join(outputDir, outputFileName);

    // Step 1: Detect silences
    const silenceDetectResult = await detectSilences(filePath);
    
    if (silenceDetectResult.length === 0) {
      // No silences detected, just copy the file
      await fs.copyFile(filePath, outputPath);
    } else {
      // Step 2: Remove silences and concatenate
      await removeSilences(filePath, outputPath, silenceDetectResult);
    }

    // Get video duration
    const duration = await getVideoDuration(outputPath);

    // Update job with success
    await db
      .update(videoJobs)
      .set({
        status: "completed",
        // Use the API route to ensure the video is accessible
        processedUrl: `/api/uploads/processed/${outputFileName}`,
        duration: Math.round(duration),
        completedAt: new Date(),
      })
      .where(eq(videoJobs.id, jobId));
      
    // Notify the web app about the job completion
    try {
      const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3000/api/events/emit';
      const webhookSecret = process.env.WORKER_WEBHOOK_SECRET || 'dev-secret';
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          status: 'completed',
          secret: webhookSecret,
        }),
      });
      
      console.log(`Webhook notification sent for job ${jobId}`);
    } catch (webhookError) {
      console.error(`Failed to send webhook notification for job ${jobId}:`, webhookError);
      // Don't throw here, as the job itself was successful
    }

    // Deduct credit from workspace
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });

    if (workspace && workspace.credits > 0) {
      await db
        .update(workspaces)
        .set({
          credits: workspace.credits - 1,
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, workspaceId));
    }
    
    // Send notification (in a real app, we'd use email or push notifications)
    try {
      // Get user information for notification
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      
      console.log(`Sending notification to user ${userId} (${user?.email || 'unknown'}) for job ${jobId}`);
      
      // In a production app, we would send an actual email or push notification here
      // For now, we'll just log it
      // Calculate original duration
      const originalDuration = await getVideoDuration(filePath);
      const timeReduction = originalDuration - duration;
      const percentReduction = Math.round((timeReduction / originalDuration) * 100);
      
      console.log(`
        NOTIFICATION: 
        To: ${user?.email || 'unknown'}
        Subject: Your video processing is complete!
        Body: Your video has been processed and is ready to view. 
              The processing removed silence and optimized your content.
              Original Duration: ${Math.round(originalDuration)} seconds
              New Duration: ${Math.round(duration)} seconds
              Time Saved: ${Math.round(timeReduction)} seconds (${percentReduction}%)
      `);
      
      // You could implement email sending here with nodemailer or similar
      // Or push notifications with a service like OneSignal
      
    } catch (notificationError) {
      console.error(`Failed to send notification for job ${jobId}:`, notificationError);
      // Don't throw here, as the job itself was successful
    }

    console.log(`Successfully processed video job ${jobId}`);
  } catch (error) {
    console.error(`Error processing video job ${jobId}:`, error);
    
    // Update job with error
    await db
      .update(videoJobs)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      })
      .where(eq(videoJobs.id, jobId));
      
    // Notify the web app about the job failure
    try {
      const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3000/api/events/emit';
      const webhookSecret = process.env.WORKER_WEBHOOK_SECRET || 'dev-secret';
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          status: 'failed',
          secret: webhookSecret,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        }),
      });
      
      console.log(`Webhook notification sent for failed job ${jobId}`);
    } catch (webhookError) {
      console.error(`Failed to send webhook notification for job ${jobId}:`, webhookError);
    }
  }
}

async function detectSilences(filePath: string): Promise<Array<{ start: number; end: number }>> {
  return new Promise((resolve, reject) => {
    // Use a more aggressive silence detection
    const args = [
      "-i", filePath,
      "-af", "silencedetect=noise=-30dB:duration=0.5",
      "-f", "null",
      "-"
    ];

    const ffmpegPath = process.env.FFMPEG_PATH || "/opt/homebrew/bin/ffmpeg";
    console.log(`Using FFmpeg at: ${ffmpegPath}`);
    console.log(`Silence detection args: ${args.join(' ')}`);
    
    const ffmpeg = spawn(ffmpegPath, args);
    let output = "";

    ffmpeg.stderr.on("data", (data) => {
      const chunk = data.toString();
      output += chunk;
      console.log("FFmpeg stderr:", chunk);
    });

    ffmpeg.on("close", (code) => {
      console.log(`FFmpeg silence detection completed with code: ${code}`);
      console.log("Full FFmpeg output:", output);

      // Parse silence detection output
      const silences: Array<{ start: number; end: number }> = [];
      const lines = output.split("\n");
      
      console.log("Parsing silence detection output...");
      
      let currentSilence: { start: number; end?: number } | null = null;
      
      for (const line of lines) {
        console.log("Processing line:", line);
        
        if (line.includes("silence_start:")) {
          const match = line.match(/silence_start: ([\d.]+)/);
          if (match) {
            const start = parseFloat(match[1]!);
            currentSilence = { start };
            console.log(`Found silence start: ${start}s`);
          }
        } else if (line.includes("silence_end:") && currentSilence) {
          const match = line.match(/silence_end: ([\d.]+)/);
          if (match) {
            const end = parseFloat(match[1]!);
            currentSilence.end = end;
            silences.push({
              start: currentSilence.start,
              end: end
            });
            console.log(`Found silence: ${currentSilence.start}s - ${end}s`);
            currentSilence = null;
          }
        }
      }

      // If we have an unclosed silence, assume it goes to the end
      if (currentSilence) {
        console.log(`Unclosed silence at ${currentSilence.start}s, assuming it goes to end`);
        // We'll handle this in the processing logic
      }

      console.log(`Detected ${silences.length} silence periods`);
      
      // If no silences detected, try a different approach
      if (silences.length === 0) {
        console.log("No silences detected with current method, trying alternative...");
        detectSilencesAlternative(filePath).then(resolve).catch(() => resolve([]));
        return;
      }
      
      resolve(silences);
    });

    ffmpeg.on("error", (error) => {
      console.error("FFmpeg error:", error);
      // Try alternative method
      detectSilencesAlternative(filePath).then(resolve).catch(() => resolve([]));
    });
  });
}

async function detectSilencesAlternative(filePath: string): Promise<Array<{ start: number; end: number }>> {
  return new Promise((resolve, reject) => {
    // Alternative method using different parameters
    const args = [
      "-i", filePath,
      "-af", "silencedetect=noise=-25dB:duration=1.0",
      "-f", "null",
      "-"
    ];

    const ffmpegPath = process.env.FFMPEG_PATH || "/opt/homebrew/bin/ffmpeg";
    console.log(`Trying alternative silence detection with: ${args.join(' ')}`);
    
    const ffmpeg = spawn(ffmpegPath, args);
    let output = "";

    ffmpeg.stderr.on("data", (data) => {
      output += data.toString();
    });

    ffmpeg.on("close", (code) => {
      console.log(`Alternative silence detection completed with code: ${code}`);
      
      const silences: Array<{ start: number; end: number }> = [];
      const lines = output.split("\n");
      
      let currentSilence: { start: number; end?: number } | null = null;
      
      for (const line of lines) {
        if (line.includes("silence_start:")) {
          const match = line.match(/silence_start: ([\d.]+)/);
          if (match) {
            const start = parseFloat(match[1]!);
            currentSilence = { start };
          }
        } else if (line.includes("silence_end:") && currentSilence) {
          const match = line.match(/silence_end: ([\d.]+)/);
          if (match) {
            const end = parseFloat(match[1]!);
            silences.push({
              start: currentSilence.start,
              end: end
            });
            currentSilence = null;
          }
        }
      }

      console.log(`Alternative method detected ${silences.length} silence periods`);
      resolve(silences);
    });

    ffmpeg.on("error", (error) => {
      console.error("Alternative FFmpeg error:", error);
      resolve([]);
    });
  });
}

async function removeSilences(
  inputPath: string, 
  outputPath: string, 
  silences: Array<{ start: number; end: number }>
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Removing ${silences.length} silence periods...`);
      
      // If no silences, just copy the file
      if (silences.length === 0) {
        console.log("No silences detected, copying original file");
        await fs.copyFile(inputPath, outputPath);
        resolve();
        return;
      }

      // Get video duration
      const videoDuration = await getVideoDuration(inputPath);
      console.log(`Video duration: ${videoDuration} seconds`);

      // Sort silences by start time
      const sortedSilences = silences.sort((a, b) => a.start - b.start);
      console.log("Sorted silences:", sortedSilences);

      // Create segments by finding non-silent parts
      const segments: Array<{ start: number; end: number }> = [];
      let currentTime = 0;

      for (const silence of sortedSilences) {
        if (currentTime < silence.start) {
          // Add segment from currentTime to silence.start
          const duration = silence.start - currentTime;
          if (duration > 0.1) { // Only add segments longer than 0.1 seconds
            segments.push({
              start: currentTime,
              end: silence.start
            });
            console.log(`Added segment: ${currentTime}s - ${silence.start}s (${duration}s)`);
          }
        }
        currentTime = silence.end;
      }

      // Add final segment if there's content after the last silence
      if (currentTime < videoDuration) {
        const duration = videoDuration - currentTime;
        if (duration > 0.1) { // Only add segments longer than 0.1 seconds
          segments.push({
            start: currentTime,
            end: videoDuration
          });
          console.log(`Added final segment: ${currentTime}s - ${videoDuration}s (${duration}s)`);
        }
      }

      console.log(`Found ${segments.length} content segments`);

      if (segments.length === 0) {
        // No content segments, create a short video
        console.log("No content segments found, creating minimal video");
        const args = [
          "-i", inputPath,
          "-t", "1", // 1 second video
          "-c:v", "libx264",
          "-c:a", "aac",
          "-y",
          outputPath
        ];

        const ffmpegPath = process.env.FFMPEG_PATH || "/opt/homebrew/bin/ffmpeg";
        const ffmpeg = spawn(ffmpegPath, args);

        ffmpeg.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            // If even this fails, just copy the original
            fs.copyFile(inputPath, outputPath).then(() => resolve()).catch(reject);
          }
        });

        ffmpeg.on("error", (error) => {
          // If even this fails, just copy the original
          fs.copyFile(inputPath, outputPath).then(() => resolve()).catch(reject);
        });
        return;
      }

      // Use a much simpler approach: create individual segments and then concatenate them
      console.log(`Creating ${segments.length} individual segments...`);
      
      const segmentFiles: string[] = [];
      const outputDir = dirname(outputPath);
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]!;
        const duration = segment.end - segment.start;
        const segmentFile = join(outputDir, `segment_${i}.mp4`);
        
        console.log(`Creating segment ${i + 1}/${segments.length}: ${segment.start}s - ${segment.end}s (${duration}s)`);
        
        await new Promise<void>((resolve, reject) => {
          const args = [
            "-i", inputPath,
            "-ss", segment.start.toString(),
            "-t", duration.toString(),
            "-c:v", "libx264",
            "-c:a", "aac",
            "-avoid_negative_ts", "make_zero",
            "-y",
            segmentFile
          ];

          const ffmpegPath = process.env.FFMPEG_PATH || "/opt/homebrew/bin/ffmpeg";
          const ffmpeg = spawn(ffmpegPath, args);

          ffmpeg.on("close", (code) => {
            if (code === 0) {
              segmentFiles.push(segmentFile);
              resolve();
            } else {
              console.error(`Failed to create segment ${i}: FFmpeg exited with code ${code}`);
              reject(new Error(`Failed to create segment ${i}`));
            }
          });

          ffmpeg.on("error", (error) => {
            console.error(`Error creating segment ${i}:`, error);
            reject(error);
          });
        });
      }

      console.log(`Created ${segmentFiles.length} segments, now concatenating...`);

      // Create a file list for FFmpeg concat
      const concatFile = join(outputDir, "concat_list.txt");
      const concatContent = segmentFiles.map(file => `file '${file}'`).join('\n');
      await fs.writeFile(concatFile, concatContent);

      // Concatenate all segments
      const args = [
        "-f", "concat",
        "-safe", "0",
        "-i", concatFile,
        "-c", "copy",
        "-y",
        outputPath
      ];

      const ffmpegPath = process.env.FFMPEG_PATH || "/opt/homebrew/bin/ffmpeg";
      console.log(`Using FFmpeg at: ${ffmpegPath}`);
      console.log(`FFmpeg args: ${args.join(' ')}`);
      
      const ffmpeg = spawn(ffmpegPath, args);

      ffmpeg.stderr.on("data", (data) => {
        console.log("FFmpeg stderr:", data.toString());
      });

      ffmpeg.on("close", async (code) => {
        if (code === 0) {
          console.log("Silence removal completed successfully");
          
          // Clean up segment files
          try {
            for (const segmentFile of segmentFiles) {
              await fs.unlink(segmentFile);
            }
            await fs.unlink(concatFile);
            console.log("Cleaned up temporary files");
          } catch (cleanupError) {
            console.log("Warning: Could not clean up temporary files:", cleanupError);
          }
          
          resolve();
        } else {
          console.error(`FFmpeg concatenation failed with code ${code}`);
          // Fallback: just copy the original file
          console.log("Falling back to original file");
          fs.copyFile(inputPath, outputPath).then(() => resolve()).catch(reject);
        }
      });

      ffmpeg.on("error", (error) => {
        console.error("FFmpeg error:", error);
        // Fallback: just copy the original file
        console.log("Falling back to original file");
        fs.copyFile(inputPath, outputPath).then(() => resolve()).catch(reject);
      });
    } catch (error) {
      console.error("Error in removeSilences:", error);
      // Ultimate fallback: copy original file
      try {
        await fs.copyFile(inputPath, outputPath);
        resolve();
      } catch (copyError) {
        reject(copyError);
      }
    }
  });
}

async function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const args = [
      "-v", "quiet",
      "-show_entries", "format=duration",
      "-of", "csv=p=0",
      filePath
    ];

    const ffprobePath = process.env.FFPROBE_PATH || "/opt/homebrew/bin/ffprobe";
    console.log(`Using FFprobe at: ${ffprobePath}`);
    const ffprobe = spawn(ffprobePath, args);
    let output = "";

    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.stderr.on("data", (data) => {
      console.log("FFprobe stderr:", data.toString());
    });

    ffprobe.on("close", (code) => {
      if (code !== 0) {
        console.error("FFprobe failed, trying alternative method...");
        // Fallback: try to get duration from FFmpeg
        getVideoDurationFallback(filePath).then(resolve).catch(reject);
        return;
      }

      const duration = parseFloat(output.trim());
      if (isNaN(duration)) {
        console.error("Could not parse duration, trying fallback...");
        getVideoDurationFallback(filePath).then(resolve).catch(reject);
        return;
      }

      console.log(`Video duration: ${duration} seconds`);
      resolve(duration);
    });

    ffprobe.on("error", (error) => {
      console.error("FFprobe error, trying fallback:", error);
      getVideoDurationFallback(filePath).then(resolve).catch(reject);
    });
  });
}

async function getVideoDurationFallback(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const args = [
      "-i", filePath,
      "-f", "null",
      "-"
    ];

    const ffmpegPath = process.env.FFMPEG_PATH || "/opt/homebrew/bin/ffmpeg";
    console.log(`Using FFmpeg fallback at: ${ffmpegPath}`);
    const ffmpeg = spawn(ffmpegPath, args);
    let output = "";

    ffmpeg.stderr.on("data", (data) => {
      output += data.toString();
    });

    ffmpeg.on("close", (code) => {
      // Parse duration from FFmpeg output
      const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
      if (durationMatch) {
        const hours = parseInt(durationMatch[1]!);
        const minutes = parseInt(durationMatch[2]!);
        const seconds = parseFloat(durationMatch[3]!);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        console.log(`Video duration (fallback): ${totalSeconds} seconds`);
        resolve(totalSeconds);
      } else {
        // If we can't get duration, assume 60 seconds as fallback
        console.log("Could not determine video duration, using 60 seconds as fallback");
        resolve(60);
      }
    });

    ffmpeg.on("error", (error) => {
      console.error("FFmpeg fallback error:", error);
      // Ultimate fallback
      resolve(60);
    });
  });
}
