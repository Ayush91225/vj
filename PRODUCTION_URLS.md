# 🚀 VajraOpz Production URLs

## Frontend (Vercel)
**URL**: https://vj-eta.vercel.app/

**Status**: ✅ Deployed and Live

**Features**:
- GitHub OAuth Login
- User Profile Display
- Real GitHub Repository Fetching
- Live File Tree from GitHub API
- Responsive Design

---

## Backend (AWS Lambda) - TO BE DEPLOYED

### Step 1: Update GitHub OAuth App
Go to: https://github.com/settings/developers

Update your OAuth App (`Iv23liqkVfyeR5Wi86hU`):
- **Homepage URL**: `https://vj-eta.vercel.app`
- **Authorization callback URL**: `https://vj-eta.vercel.app/auth/callback`

### Step 2: Deploy to AWS Lambda

**Create deployment package:**
```bash
cd backend/lambda/api
pip install -r requirements.txt -t package/
cp handler.py package/
cd package && zip -r ../deployment.zip . && cd ..
```

**Create Lambda function:**
```bash
aws lambda create-function \
  --function-name vajraopz-prod-api \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler handler.lambda_handler \
  --zip-file fileb://deployment.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{
    IS_LOCAL=false,
    GITHUB_CLIENT_ID=Iv23liqkVfyeR5Wi86hU,
    GITHUB_CLIENT_SECRET=991ec85a058dbfad3b9bdfab5f6bd290ff8b7d65,
    FRONTEND_URL=https://vj-eta.vercel.app,
    CALLBACK_URL=https://vj-eta.vercel.app/auth/callback,
    JWT_SECRET=$(openssl rand -hex 32)
  }"
```

**Create API Gateway:**
1. Go to AWS API Gateway Console
2. Create REST API
3. Create resource: `/graphql`
4. Create method: `POST`
5. Integration type: Lambda Function
6. Select: `vajraopz-prod-api`
7. Enable CORS
8. Deploy to stage: `prod`
9. Copy Invoke URL

### Step 3: Update Vercel Environment Variables

Go to: https://vercel.com/dashboard → vj → Settings → Environment Variables

Add:
```
VITE_API_BASE_URL = https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
```

Then redeploy:
```bash
git add .
git commit -m "Update API URL"
git push origin main
```

---

## 🧪 Testing

### Test Frontend (Working Now)
Visit: https://vj-eta.vercel.app/

Should see:
- ✅ Login page
- ✅ "Continue with GitHub" button
- ⏳ Auth will work after backend is deployed

### Test Backend (After Deployment)
```bash
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { githubAuth { url state } }"}'
```

Should return:
```json
{
  "data": {
    "githubAuth": {
      "url": "https://github.com/login/oauth/authorize?...",
      "state": "uuid-here"
    }
  }
}
```

---

## 📋 Deployment Checklist

- [x] Frontend deployed to Vercel
- [x] Frontend URL: https://vj-eta.vercel.app/
- [x] Code pushed to GitHub
- [ ] Update GitHub OAuth callback URL
- [ ] Deploy backend to AWS Lambda
- [ ] Create API Gateway
- [ ] Update Vercel env vars with API URL
- [ ] Test end-to-end auth flow

---

## 🔗 Quick Links

- **Frontend**: https://vj-eta.vercel.app/
- **GitHub Repo**: https://github.com/Ayush91225/vj
- **Vercel Dashboard**: https://vercel.com/dashboard
- **AWS Console**: https://console.aws.amazon.com/lambda
- **GitHub OAuth Settings**: https://github.com/settings/developers

---

## 💡 Next Steps

1. **Deploy Backend to AWS Lambda** (see Step 2 above)
2. **Update GitHub OAuth callback URL** to `https://vj-eta.vercel.app/auth/callback`
3. **Update Vercel env vars** with your API Gateway URL
4. **Test the full auth flow**

---

## 🎉 What's Live Now

✅ Frontend is live at: **https://vj-eta.vercel.app/**

The app is deployed and accessible. Once you deploy the backend to AWS Lambda and update the environment variables, the GitHub authentication will work end-to-end!
