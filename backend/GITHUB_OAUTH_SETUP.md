# GitHub OAuth App Setup

## Step 1: Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: VajraOpz
   - **Homepage URL**: `https://vajraopz.vercel.app` (or your custom domain)
   - **Application description**: AI-powered DevOps platform for automated code fixing
   - **Authorization callback URL**: `https://vajraopz.vercel.app/auth/callback`

## Step 2: Get Credentials

After creating the app, you'll get:
- **Client ID**: Copy this value
- **Client Secret**: Generate and copy this value

## Step 3: Set Environment Variables

```bash
export GITHUB_CLIENT_ID=your_client_id_here
export GITHUB_CLIENT_SECRET=your_client_secret_here
```

## Step 4: Production URLs

For production deployment:
- **Homepage URL**: `https://vajraopz.vercel.app`
- **Authorization callback URL**: `https://vajraopz.vercel.app/auth/callback`

## Required Scopes

The application requests these GitHub scopes:
- `repo`: Access to repositories for code analysis
- `user:email`: Access to user email for account creation

## Security Notes

- Client Secret should be stored securely in AWS SSM Parameter Store
- Use HTTPS in production
- Implement proper CSRF protection with state parameter
- Vercel automatically provides HTTPS for all deployments