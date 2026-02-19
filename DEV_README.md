# VajraOpz Development Setup

Quick setup guide for local development with AWS backend.

## 🚀 Quick Start

### 1. GitHub OAuth Setup (Development)

Create a GitHub OAuth App for development:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Configure:
   - **Application name**: `VajraOpz Dev`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`

Set environment variables:
```bash
export GITHUB_CLIENT_ID=your_dev_client_id
export GITHUB_CLIENT_SECRET=your_dev_client_secret
```

### 2. Run Development Setup

```bash
cd backend
./setup-dev.sh
```

This will:
- Deploy minimal AWS infrastructure (DynamoDB, S3)
- Set up local Lambda development server
- Configure GitHub OAuth parameters
- Create development environment files

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend/lambda/api
pip install -r dev_requirements.txt
python dev_server.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/graphql
- **GitHub OAuth Callback**: http://localhost:3000/auth/callback

## 🛠️ Development Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Dev     │    │   Flask Server   │    │   AWS Services  │
│   localhost:3000│───▶│   localhost:3001 │───▶│   DynamoDB + S3 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔧 Development Features

- **Hot Reload**: Frontend auto-reloads on changes
- **Local API**: Flask server mimics Lambda environment
- **AWS Integration**: Real DynamoDB and S3 for testing
- **GitHub OAuth**: Full authentication flow
- **CORS Enabled**: No cross-origin issues

## 📝 Environment Variables

Development environment automatically created in `.env.development`:

```bash
VITE_API_BASE_URL=http://localhost:3001/graphql
VITE_ENVIRONMENT=development
AWS_REGION=us-east-1
# ... other variables
```

## 🧪 Testing

### Test GraphQL API
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { githubAuth { url state } }"}'
```

### Test Frontend
1. Open http://localhost:3000
2. Click "Continue with GitHub"
3. Complete OAuth flow
4. Create a test project
5. Trigger agent execution

## 🔍 Debugging

### Backend Logs
```bash
# Flask server shows logs in terminal
cd backend/lambda/api
python dev_server.py
```

### Frontend Logs
```bash
# Browser console shows React logs
# Vite dev server shows build logs
npm run dev
```

### AWS Resources
```bash
# Check DynamoDB tables
aws dynamodb list-tables

# Check S3 bucket
aws s3 ls vajraopz-dev-code-storage-*
```

## 🚨 Common Issues

### 1. GitHub OAuth Fails
- Verify callback URL is exactly `http://localhost:3000/auth/callback`
- Check environment variables are set
- Ensure GitHub app is configured for development

### 2. CORS Errors
- Flask-CORS is enabled by default
- Restart Flask server if issues persist

### 3. AWS Permissions
- Ensure AWS CLI is configured
- Check IAM permissions for DynamoDB and S3

## 🔄 Development Workflow

1. **Make Changes**: Edit React components or Lambda handler
2. **Test Locally**: Use development servers
3. **Debug**: Check browser console and Flask logs
4. **Iterate**: Hot reload handles most changes automatically

## 📦 Production Deployment

When ready for production:
```bash
# Deploy full production infrastructure
cd backend
./deploy.sh

# Deploy frontend to Vercel
./deploy-frontend.sh https://your-api-url
```

---

**Happy coding! 🚀**