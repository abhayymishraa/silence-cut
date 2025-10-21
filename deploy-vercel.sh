#!/bin/bash

# Vercel Deployment Script
echo "🚀 Deploying Video Processor to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app will be available at: https://your-app.vercel.app"
echo ""
echo "Next steps:"
echo "1. Set up your environment variables in Vercel dashboard"
echo "2. Set up Supabase for database (free)"
echo "3. Set up Upstash for Redis (free)"
echo "4. Configure Stripe webhooks"
echo "5. Test your deployment"
echo ""
echo "Environment variables to set in Vercel:"
echo "- DATABASE_URL (from Supabase)"
echo "- REDIS_URL (from Upstash)"
echo "- AUTH_SECRET (generate random string)"
echo "- NEXTAUTH_URL (your Vercel app URL)"
echo "- STRIPE_SECRET_KEY (from Stripe)"
echo "- STRIPE_PUBLISHABLE_KEY (from Stripe)"
echo "- STRIPE_WEBHOOK_SECRET (from Stripe)"
echo "- ENABLE_DEMO_LOGIN=true"
echo "- DEMO_PASSWORD=demo123"
