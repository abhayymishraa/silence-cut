# Video Processor Worker

This is the background worker service for processing videos and removing silences.

## Features

- Processes video jobs from Redis queue
- Removes silences using FFmpeg
- Updates job status in database
- Sends notifications on completion
- Deducts credits from workspace

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

3. Start the worker:
```bash
npm run dev  # Development
npm start    # Production
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `FFMPEG_PATH`: Path to FFmpeg binary (optional)
- `FFPROBE_PATH`: Path to FFprobe binary (optional)

## Deployment

This worker can be deployed independently from the main web application:

- **Docker**: Use the provided Dockerfile.worker
- **Railway**: Deploy as a separate service
- **AWS ECS**: Run as a separate task
- **Kubernetes**: Deploy as a separate pod

## Monitoring

The worker logs all job processing activities and errors. Monitor the logs for:
- Job completion status
- Processing errors
- FFmpeg execution issues
- Database connection problems
