# Deployment Guide

This guide will help you deploy the Video Processor application to Railway.

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. A PostgreSQL database (Railway provides this)
3. A Redis instance (Railway provides this)
4. Stripe account for payments
5. Google OAuth credentials (optional)

## Step 1: Deploy to Railway

### Option A: Deploy via Railway CLI

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize Railway project:
```bash
railway init
```

4. Deploy:
```bash
railway up
```

### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Connect your GitHub repository to Railway
3. Railway will automatically deploy from your main branch

## Step 2: Set up Environment Variables

In your Railway dashboard, add these environment variables:

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Redis
REDIS_URL=redis://username:password@host:port

# NextAuth
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.railway.app

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Demo Login (for testing)
ENABLE_DEMO_LOGIN=true
DEMO_PASSWORD=your-demo-password

# File Upload
UPLOAD_DIR=/tmp/uploads
```

### Optional Variables

```bash
# Email (if using email auth)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Worker (if running separately)
WORKER_REDIS_URL=redis://username:password@host:port
```

## Step 3: Set up Database

1. Railway will automatically create a PostgreSQL database
2. The application will run migrations on startup
3. You can also run migrations manually:
```bash
railway run npx drizzle-kit push:pg
```

## Step 4: Set up Redis

1. Add a Redis service in Railway
2. Railway will provide the `REDIS_URL` automatically

## Step 5: Configure Stripe

1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Set up webhooks pointing to `https://your-app.railway.app/api/stripe/webhook`
4. Add the webhook secret to your environment variables

## Step 6: Configure Google OAuth (Optional)

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add `https://your-app.railway.app/api/auth/callback/google` as redirect URI
4. Add the client ID and secret to your environment variables

## Step 7: Test Deployment

1. Visit your Railway app URL
2. Test the signup/signin flow
3. Test video upload and processing
4. Test the white-label features

## Custom Domains

To set up custom domains for white-labeling:

1. Add your domain to Railway
2. Update the `customDomain` field in your workspace settings
3. Configure DNS to point to Railway

## Monitoring

Railway provides built-in monitoring:
- Logs are available in the Railway dashboard
- Metrics are shown for CPU, memory, and network usage
- You can set up alerts for errors

## Scaling

Railway automatically scales your application based on traffic. For high-traffic applications:
- Consider using Railway's Pro plan
- Set up multiple instances
- Use Railway's load balancer

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are in package.json
2. **Database Connection**: Verify DATABASE_URL is correct
3. **Redis Connection**: Verify REDIS_URL is correct
4. **Environment Variables**: Ensure all required variables are set

### Logs

Check logs in Railway dashboard:
```bash
railway logs
```

### Database Issues

Connect to database:
```bash
railway connect postgres
```

Run migrations:
```bash
railway run npx drizzle-kit push:pg
```

## Security Considerations

1. Use strong, unique passwords for all services
2. Enable HTTPS (Railway provides this automatically)
3. Regularly update dependencies
4. Monitor for security vulnerabilities
5. Use environment variables for all secrets
6. Enable Stripe webhook signature verification

## Backup

Railway provides automatic backups for PostgreSQL databases. For additional backup:
1. Export database regularly
2. Backup uploaded files
3. Keep environment variables secure

## Cost Optimization

1. Monitor usage in Railway dashboard
2. Use appropriate instance sizes
3. Optimize database queries
4. Use CDN for static assets
5. Implement caching strategies