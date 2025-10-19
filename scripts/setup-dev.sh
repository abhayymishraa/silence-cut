#!/bin/bash

echo "🚀 Setting up Multi-Tenant Video Processor for Development"
echo "=========================================================="

# Create .env.local file
echo "📝 Creating .env.local file..."
cat > .env.local << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/video_processor"

# Redis (optional for development)
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production"
AUTH_SECRET="dev-secret-key-change-in-production"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# Demo credentials (for development only)
# Email: demo@example.com
# Password: demo123

# Stripe (test mode - optional for development)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Environment
NODE_ENV="development"
EOF

echo "✅ Created .env.local file"
echo ""
echo "📋 Next steps:"
echo "1. Set up a PostgreSQL database and update DATABASE_URL in .env.local"
echo "2. (Optional) Set up Redis and update REDIS_URL in .env.local"
echo "3. (Optional) Set up Stripe test account and add keys to .env.local"
echo "4. (Optional) Set up Google OAuth and add credentials to .env.local"
echo ""
echo "🔧 To start development:"
echo "npm run dev"
echo ""
echo "📚 For full setup instructions, see QUICKSTART.md"
