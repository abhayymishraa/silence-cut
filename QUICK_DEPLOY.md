# Quick Deployment Guide

## 🚀 Deploy to Railway in 5 Minutes

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```
This will open your browser to authenticate with Railway.

### Step 3: Initialize Project
```bash
railway init
```

### Step 4: Deploy
```bash
railway up
```

### Step 5: Set Environment Variables

In your Railway dashboard, add these environment variables:

#### Required Variables:
```bash
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.railway.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
ENABLE_DEMO_LOGIN=true
DEMO_PASSWORD=demo123
```

#### Optional Variables:
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 6: Add Services

In Railway dashboard:
1. Add **PostgreSQL** database
2. Add **Redis** service
3. Railway will automatically provide `DATABASE_URL` and `REDIS_URL`

### Step 7: Configure Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys
3. Set up webhook: `https://your-app.railway.app/api/stripe/webhook`
4. Add webhook secret to environment variables

### Step 8: Test Your Deployment

1. Visit your Railway app URL
2. Test signup/signin
3. Test video upload
4. Test white-label features

## 🎯 Alternative: Deploy via GitHub

1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically deploy

## 🔧 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `AUTH_SECRET` | NextAuth secret key | ✅ |
| `NEXTAUTH_URL` | Your app URL | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ✅ |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | ✅ |
| `ENABLE_DEMO_LOGIN` | Enable demo login | ✅ |
| `DEMO_PASSWORD` | Demo login password | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ❌ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ❌ |

## 🚨 Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure `Dockerfile` is in root directory

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check that PostgreSQL service is running

### Redis Connection Issues
- Verify `REDIS_URL` is set correctly
- Check that Redis service is running

### Authentication Issues
- Verify `AUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain

## 📊 Monitoring

Railway provides:
- Real-time logs
- Performance metrics
- Automatic scaling
- Health checks

## 🔒 Security

- Use strong, unique passwords
- Enable HTTPS (automatic on Railway)
- Keep environment variables secure
- Regularly update dependencies

## 💰 Cost

Railway pricing:
- **Hobby Plan**: $5/month (1GB RAM, 1GB storage)
- **Pro Plan**: $20/month (8GB RAM, 100GB storage)
- **Team Plan**: $99/month (32GB RAM, 500GB storage)

## 🎉 Success!

Your Video Processor app is now live! 

- **Main URL**: `https://your-app.railway.app`
- **Custom Domain**: Set up in Railway dashboard
- **White-label**: Configure in app settings
- **Monitoring**: Available in Railway dashboard
