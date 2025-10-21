#!/bin/bash

# Railway Deployment Script
echo "🚀 Deploying Video Processor to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "Please login to Railway:"
    railway login
fi

# Initialize Railway project (if not already initialized)
if [ ! -f "railway.json" ]; then
    echo "📦 Initializing Railway project..."
    railway init
fi

# Set environment variables
echo "🔧 Setting up environment variables..."
echo "Please set the following environment variables in Railway dashboard:"
echo ""
echo "Required:"
echo "- DATABASE_URL (Railway will provide this automatically)"
echo "- REDIS_URL (Railway will provide this automatically)"
echo "- AUTH_SECRET (generate a random string)"
echo "- NEXTAUTH_URL (your Railway app URL)"
echo "- STRIPE_SECRET_KEY (from Stripe dashboard)"
echo "- STRIPE_PUBLISHABLE_KEY (from Stripe dashboard)"
echo "- STRIPE_WEBHOOK_SECRET (from Stripe webhook settings)"
echo ""
echo "Optional:"
echo "- GOOGLE_CLIENT_ID (from Google Cloud Console)"
echo "- GOOGLE_CLIENT_SECRET (from Google Cloud Console)"
echo "- ENABLE_DEMO_LOGIN=true"
echo "- DEMO_PASSWORD=your-demo-password"
echo ""

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your app will be available at: https://your-app.railway.app"
echo ""
echo "Next steps:"
echo "1. Set up your environment variables in Railway dashboard"
echo "2. Configure your database and Redis"
echo "3. Set up Stripe webhooks"
echo "4. Test your deployment"
