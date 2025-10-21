# Video Processor - Multi-Tenant Video Processing Platform

A full-stack Next.js application for processing videos with multi-tenancy, white-labeling, and payment integration.

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)

1. **Push to GitHub** (if not already done)
2. **Go to [Vercel](https://vercel.com)**
3. **Import your GitHub repository**
4. **Set environment variables** (see below)
5. **Deploy!**

### Environment Variables

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.azthomahipybylyzipgx:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres"

# Redis (Upstash)
REDIS_URL="rediss://default:AU2KAAIncDJiMjQzNGJlZjJjMTU0ZDU1YTgyOGUxYjdlYjY3ODA3N3AyMTk4NTA@first-ladybird-19850.upstash.io:6379"

# Authentication
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-app.vercel.app"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Demo Login
ENABLE_DEMO_LOGIN="true"
DEMO_PASSWORD="demo123"
```

## 🏗️ Features

- ✅ **Multi-tenant architecture**
- ✅ **White-label branding**
- ✅ **Video processing with silence removal**
- ✅ **Stripe payment integration**
- ✅ **Real-time notifications**
- ✅ **Workspace management**
- ✅ **Custom domains**

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: tRPC, NextAuth.js
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (Upstash)
- **Payments**: Stripe
- **Video Processing**: FFmpeg
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── server/             # Backend logic
├── contexts/           # React contexts
└── lib/               # Utilities
```

## 🔧 Development

```bash
npm install
npm run dev
```

## 📝 License

MIT