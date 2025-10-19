# Deployment Guide for Multi-Tenant Video Processor

This guide explains how to deploy the Multi-Tenant Video Processor application to Railway.

## Prerequisites

- [Railway Account](https://railway.app/)
- [Stripe Account](https://stripe.com/) (for payment processing)
- [GitHub Account](https://github.com/) (for deployment from repository)

## Environment Variables

The following environment variables are required for deployment:

### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `NEXTAUTH_URL` | Full URL of your application (e.g., https://your-app.railway.app) |
| `NEXTAUTH_SECRET` | Random string for NextAuth.js session encryption |
| `AUTH_SECRET` | Same as NEXTAUTH_SECRET |
| `NODE_ENV` | Set to "production" for production deployment |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `STRIPE_SECRET_KEY` | Stripe Secret Key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key |

## Railway Deployment Steps

### 1. Create New Project

1. Log in to [Railway](https://railway.app/)
2. Click "New Project" and select "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect the Next.js application

### 2. Set Up Database Service

1. Click "New Service" and select "Database"
2. Choose "PostgreSQL"
3. Railway will provision a PostgreSQL database and generate a `DATABASE_URL`

### 3. Set Up Redis Service

1. Click "New Service" and select "Database"
2. Choose "Redis"
3. Railway will provision a Redis instance and generate a `REDIS_URL`

### 4. Set Up Web Service

1. In your project, click on the service deployed from your GitHub repository
2. Go to the "Variables" tab
3. Add all required environment variables
4. Configure the build settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`

### 5. Set Up Worker Service

1. Click "New Service" and select "Empty Service"
2. Connect it to the same GitHub repository
3. Set the following settings:
   - Build Command: `npm install`
   - Start Command: `npm run worker`
4. Add the same environment variables as the web service

### 6. Configure Shared Storage

Railway offers persistent volumes for file storage:

1. Go to your project settings
2. Add a volume and mount it to both web and worker services at `/app/uploads`

### 7. Set Up Stripe Webhook

1. In your Stripe Dashboard, go to "Developers" > "Webhooks"
2. Add a new endpoint with your Railway URL: `https://your-app.railway.app/api/webhooks/stripe`
3. Add the following events:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET` in your Railway variables

### 8. Set Up Domain and SSL

1. Go to your project settings in Railway
2. Click on "Settings" for your web service
3. Under "Domains", add your custom domain or use the provided Railway domain
4. Railway will automatically provision SSL certificates

## Custom Domain Setup

### For Your Main Application

1. Add your domain in Railway settings
2. Update DNS records at your domain registrar:
   - Add a CNAME record pointing to your Railway domain
   - Example: `app.yourdomain.com` → `your-app.railway.app`

### For White-Label Domains

1. Instruct your customers to add a CNAME record pointing to your main domain:
   - Example: `video.customerdomain.com` → `app.yourdomain.com`
2. In your application, add the custom domain to the workspace settings

## Scaling Considerations

- **Web Service**: Scale horizontally by increasing the number of instances
- **Worker Service**: Scale horizontally for more concurrent video processing
- **Database**: Upgrade the plan as your data grows
- **Redis**: Monitor queue size and upgrade as needed

## Monitoring

Railway provides basic monitoring for all services. For more advanced monitoring:

1. Set up logging with a service like Papertrail or LogDNA
2. Use Railway's metrics dashboard to monitor resource usage
3. Set up alerts for critical failures

## Backup Strategy

1. **Database**: Set up regular backups of your PostgreSQL database
2. **File Storage**: Consider backing up the uploads directory to an external storage service

## Troubleshooting

### Common Issues

1. **Worker Not Processing Jobs**:
   - Check Redis connection
   - Verify worker logs for errors
   - Ensure FFmpeg is installed correctly

2. **Database Connection Issues**:
   - Check DATABASE_URL format
   - Verify IP allowlist settings

3. **Authentication Problems**:
   - Verify NEXTAUTH_URL matches your actual domain
   - Check AUTH_SECRET is set correctly

For additional help, refer to the Railway documentation or contact support.