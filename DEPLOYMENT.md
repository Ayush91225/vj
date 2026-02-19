# VajraOpz Production Deployment Guide

## 🚀 Quick Deployment

### Frontend (Vercel)
```bash
# Push to GitHub (Vercel auto-deploys)
git add .
git commit -m "Production ready"
git push origin main
```

### Backend (AWS Lambda)
```bash
cd backend
./deploy-lambda.sh
```

---

## 📋 Pre-Deployment Checklist

### 1. GitHub OAuth App Configuration
- Go to: https://github.com/settings/developers
- Update OAuth App:
  - **Homepage URL**: `https://vajraopz.vercel.app`
  - **Callback URL**: `https://vajraopz.vercel.app/auth/callback`

### 2. AWS Setup
- [ ] AWS Account with appropriate permissions
- [ ] AWS CLI configured (`aws configure`)
- [ ] Lambda function created: `vajraopz-prod-api`
- [ ] API Gateway configured
- [ ] DynamoDB tables created (optional for production)

---

## 🔧 Backend Deployment (AWS Lambda)

### Step 1: Create Lambda Function
```bash
aws lambda create-function \
  --function-name vajraopz-prod-api \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler handler.lambda_handler \
  --zip-file fileb://backend/lambda/api/deployment.zip \
  --timeout 30 \
  --memory-size 512
```

### Step 2: Set Environment Variables
```bash
aws lambda update-function-configuration \
  --function-name vajraopz-prod-api \
  --environment Variables="{
    IS_LOCAL=false,
    GITHUB_CLIENT_ID=Iv23liqkVfyeR5Wi86hU,
    GITHUB_CLIENT_SECRET=your-secret-here,
    FRONTEND_URL=https://vajraopz.vercel.app,
    CALLBACK_URL=https://vajraopz.vercel.app/auth/callback,
    JWT_SECRET=your-jwt-secret-here
  }"
```

### Step 3: Create API Gateway
```bash
# Create REST API
aws apigateway create-rest-api \
  --name vajraopz-prod-api \
  --description "VajraOpz Production API"

# Configure routes and integrate with Lambda
# (Use AWS Console for easier setup)
```

### Step 4: Deploy Updates
```bash
cd backend
./deploy-lambda.sh

# Upload to Lambda
aws lambda update-function-code \
  --function-name vajraopz-prod-api \
  --zip-file fileb://lambda/api/deployment.zip
```

---

## 🌐 Frontend Deployment (Vercel)

### Option 1: Automatic (Recommended)
1. Push code to GitHub
2. Vercel auto-deploys from `main` branch
3. Update environment variables in Vercel dashboard

### Option 2: Manual
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Vercel Environment Variables
Set these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_BASE_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
VITE_API_TIMEOUT=30000
VITE_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
```

---

## 🔐 Security Configuration

### AWS Secrets Manager (Recommended)
Store sensitive data in AWS Secrets Manager:

```bash
# Store GitHub client secret
aws secretsmanager create-secret \
  --name vajraopz/prod/github/client_secret \
  --secret-string "your-github-client-secret"

# Store JWT secret
aws secretsmanager create-secret \
  --name vajraopz/prod/jwt/secret \
  --secret-string "$(openssl rand -hex 32)"
```

Update Lambda to use Secrets Manager:
```python
import boto3
secrets = boto3.client('secretsmanager')
secret = secrets.get_secret_value(SecretId='vajraopz/prod/github/client_secret')
GITHUB_CLIENT_SECRET = secret['SecretString']
```

---

## 🗄️ Database Setup (Optional)

### DynamoDB Tables

**Users Table:**
```bash
aws dynamodb create-table \
  --table-name vajraopz-prod-users \
  --attribute-definitions \
    AttributeName=user_id,AttributeType=S \
    AttributeName=github_id,AttributeType=S \
  --key-schema AttributeName=user_id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=github-id-index,KeySchema=[{AttributeName=github_id,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

**Projects Table:**
```bash
aws dynamodb create-table \
  --table-name vajraopz-prod-projects \
  --attribute-definitions \
    AttributeName=project_id,AttributeType=S \
    AttributeName=user_id,AttributeType=S \
  --key-schema AttributeName=project_id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=user-id-index,KeySchema=[{AttributeName=user_id,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

---

## 🧪 Testing Production

### Test Backend
```bash
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { githubAuth { url state } }"}'
```

### Test Frontend
1. Visit: https://vajraopz.vercel.app
2. Click "Continue with GitHub"
3. Authorize app
4. Should redirect back and login successfully

---

## 📊 Monitoring

### CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/vajraopz-prod-api --follow
```

### Vercel Analytics
- View in Vercel Dashboard → Analytics
- Monitor page views, performance, errors

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Lambda
        run: |
          cd backend
          ./deploy-lambda.sh
          aws lambda update-function-code \
            --function-name vajraopz-prod-api \
            --zip-file fileb://lambda/api/deployment.zip
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🐛 Troubleshooting

### Backend Issues
- **500 Error**: Check CloudWatch logs
- **CORS Error**: Verify API Gateway CORS settings
- **Auth Failed**: Check GitHub OAuth callback URL

### Frontend Issues
- **Build Failed**: Check Vercel build logs
- **API Error**: Verify VITE_API_BASE_URL is correct
- **Auth Loop**: Clear localStorage and try again

---

## 📈 Cost Estimation

### AWS (Monthly)
- Lambda: ~$0-5 (1M requests free tier)
- API Gateway: ~$3.50 (1M requests)
- DynamoDB: ~$0-5 (25GB free tier)
- **Total: ~$0-15/month**

### Vercel
- Free tier: Unlimited bandwidth
- Pro: $20/month (optional)

---

## 🔗 Production URLs

After deployment, you'll have:

- **Frontend**: https://vajraopz.vercel.app
- **Backend**: https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
- **GraphQL**: https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/graphql

---

## 📝 Post-Deployment

1. Update README.md with production URLs
2. Test all features in production
3. Monitor CloudWatch and Vercel logs
4. Set up alerts for errors
5. Configure custom domain (optional)

---

## 🆘 Support

For issues:
1. Check CloudWatch logs
2. Check Vercel deployment logs
3. Review GitHub OAuth settings
4. Verify environment variables
