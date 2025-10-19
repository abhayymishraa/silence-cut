#!/bin/bash

# Kill any existing worker processes
echo "Killing any existing worker processes..."
pkill -f "tsx index.ts" || true
pkill -f "npm exec tsx index.ts" || true
sleep 1  # Give processes time to exit

# Set environment variables
export FFMPEG_PATH="/opt/homebrew/bin/ffmpeg"
export FFPROBE_PATH="/opt/homebrew/bin/ffprobe"
export REDIS_URL="redis://localhost:6379"
export DATABASE_URL="postgresql://postgres@localhost:5432/video_processor"
export WEBHOOK_URL="http://localhost:3000/api/events/emit"
export WORKER_WEBHOOK_SECRET="dev-secret"

# Start the worker process
echo "Starting video processing worker..."
cd worker && npm run dev


# cd worker && FFMPEG_PATH="/opt/homebrew/bin/ffmpeg" FFPROBE_PATH="/opt/homebrew/bin/ffprobe" REDIS_URL="redis://localhost:6379" DATABASE_URL="postgresql://postgres@localhost:5432/video_processor"