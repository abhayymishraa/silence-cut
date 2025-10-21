# 🚀 Deployment Guide

## Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set environment variables (see below)
5. Click "Deploy"

### Step 3: Environment Variables

Add these in Vercel dashboard:

```bash
DATABASE_URL=postgresql://postgres.azthomahipybylyzipgx:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres
REDIS_URL=rediss://default:AU2KAAIncDJiMjQzNGJlZjJjMTU0ZDU1YTgyOGUxYjdlYjY3ODA3N3AyMTk4NTA@first-ladybird-19850.upstash.io:6379
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
ENABLE_DEMO_LOGIN=true
DEMO_PASSWORD=demo123
```

### Step 4: Configure Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys
3. Set up webhook: `https://your-app.vercel.app/api/stripe/webhook`
4. Add webhook secret to environment variables

### Step 5: Test
Visit your Vercel app URL and test all features!

## 🎉 Done!

Your multi-tenant video processing platform is now live!
