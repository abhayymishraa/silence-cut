# Multi-Tenant Video Silence Removal SaaS

A production-ready SaaS application that automatically removes silence from videos using AI-powered processing. Built with Next.js, tRPC, Drizzle ORM, and FFmpeg.

## 🚀 Features

- **Multi-tenant Architecture**: Support for multiple workspaces with custom branding
- **White-label Support**: Custom domains, logos, and color schemes
- **Video Processing**: Automatic silence detection and removal using FFmpeg
- **Background Jobs**: BullMQ + Redis for scalable video processing
- **Payment Integration**: Stripe Checkout for credit purchases
- **Real-time Updates**: Live job status updates and progress tracking
- **Secure**: File validation, workspace isolation, and secure uploads

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: tRPC, NextAuth.js, Drizzle ORM
- **Database**: PostgreSQL
- **Queue**: BullMQ with Redis
- **Video Processing**: FFmpeg
- **Payments**: Stripe
- **Deployment**: Docker, Railway

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- FFmpeg (for video processing)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd multi-tenant-video-processor
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/video_processor"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-auth-secret-here"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Environment
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Generate and run migrations
npx drizzle-kit generate
npx drizzle-kit migrate

# Seed the database
npx tsx scripts/seed.ts
```

### 4. Start Development

```bash
# Start the web application
npm run dev

# In another terminal, start the worker
npx tsx src/workers/videoProcessor.ts
```

### 5. Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🏗 Architecture

### Multi-Tenancy

The application supports multi-tenancy through:

- **Domain-based routing**: Custom domains resolve to specific workspaces
- **Workspace isolation**: All data is scoped to workspaces
- **White-label branding**: Custom logos, colors, and domains per workspace

### Video Processing Pipeline

1. **Upload**: User uploads video via drag-and-drop interface
2. **Validation**: File type and size validation (max 300MB)
3. **Job Creation**: Video job created with "queued" status
4. **Queue**: Job enqueued in BullMQ for background processing
5. **Processing**: Worker detects silences and removes them using FFmpeg
6. **Completion**: Job status updated, credits deducted, user notified

### Database Schema

- `users`: NextAuth user accounts
- `workspaces`: Multi-tenant workspaces with branding
- `memberships`: User-workspace relationships
- `videoJobs`: Video processing jobs and status
- `payments`: Stripe payment records

## 🔧 Configuration

### Custom Domains

To set up custom domains:

1. Add domain to workspace settings
2. Create CNAME record pointing to your app domain
3. Update middleware to handle the custom domain

### Stripe Setup

1. Create Stripe account and get API keys
2. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Configure webhook events: `checkout.session.completed`, `checkout.session.expired`

### FFmpeg Configuration

The worker uses FFmpeg with these settings:
- Silence detection: `-30dB` threshold, `0.5s` minimum duration
- Output format: MP4 with H.264 video and AAC audio
- Processing: Concatenates non-silent segments

## 📱 API Reference

### tRPC Endpoints

- `video.getJobs`: Get all video jobs for workspace
- `video.createJob`: Create new video processing job
- `video.updateJobStatus`: Update job status (internal)
- `workspace.getCurrent`: Get current workspace info
- `workspace.updateSettings`: Update workspace settings
- `payment.createCheckoutSession`: Create Stripe checkout session

### REST Endpoints

- `POST /api/upload`: Upload video file
- `GET /api/workspace/info`: Get workspace info from headers
- `POST /api/webhooks/stripe`: Stripe webhook handler

## 🚀 Deployment

### Railway Deployment

1. **Create Railway Project**:
   ```bash
   railway login
   railway init
   ```

2. **Add Services**:
   - PostgreSQL database
   - Redis database
   - Web service (Next.js)
   - Worker service (Node.js + FFmpeg)

3. **Environment Variables**:
   Set all required environment variables in Railway dashboard

4. **Deploy**:
   ```bash
   railway up
   ```

### Docker Deployment

```bash
# Build and run with docker-compose
docker-compose up -d

# Or build individual images
docker build -t video-processor-web .
docker build -t video-processor-worker -f Dockerfile.worker .
```

## 🧪 Testing

### Test Video Processing

1. Sign in to the application
2. Upload a test video (MP4 format, < 300MB)
3. Monitor job status in the dashboard
4. Download processed video when complete

### Test Stripe Integration

1. Use Stripe test mode
2. Create checkout session
3. Use test card: `4242 4242 4242 4242`
4. Verify webhook processing

## 📊 Monitoring

### Health Checks

- Web: `GET /api/health`
- Database: Connection status in logs
- Redis: Queue status in worker logs

### Logs

- Web application: Next.js logs
- Worker: BullMQ job processing logs
- Database: Query logs (if enabled)

## 🔒 Security

- File upload validation (type, size)
- Workspace isolation in all queries
- Stripe webhook signature verification
- CORS configuration
- SQL injection prevention (Drizzle ORM)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@videoprocessor.com or create an issue in the repository.

## 🎯 Roadmap

- [ ] AI-powered video chapter generation
- [ ] Batch video processing
- [ ] Advanced video editing features
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Analytics dashboard