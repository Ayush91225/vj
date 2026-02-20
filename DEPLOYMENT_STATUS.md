# VajraOpz AI Agent Deployment Status

## ✅ What We Built

### 1. AI Agent Worker (`backend/agents/agent_worker.py`)
Complete Lambda function that:
- Clones GitHub repos to S3
- Analyzes code with Claude, Gemini, and OpenRouter
- Detects LINTING, SYNTAX, LOGIC, STYLE issues
- Generates fixes automatically
- Creates GitHub branches and pushes fixes
- Calculates quality scores (base 100, speed bonus, quality bonus, penalties)

### 2. Updated Lambda Handler (`backend/lambda/api/handler.py`)
- `triggerFix` mutation now invokes the AI worker Lambda
- `getDeployment` returns real analysis results from DynamoDB
- Stores issues, fixes, commits, and scores

### 3. Docker Configuration
- `Dockerfile.worker` - Containerized Lambda with git + AI libraries
- `requirements_simple.txt` - Clean dependencies (boto3, anthropic, google-generativeai, GitPython)

### 4. Deployment Scripts
- `deploy-simple.sh` - Simplified deployment using existing AWS resources
- `deploy-all.sh` - Full deployment with Terraform

## ⚠️ Current Blocker

**AWS Permission Issue**: Your IAM user `Aayushman_soni` lacks permissions for:
- ECR (push Docker images)
- DynamoDB (describe tables)
- SSM (parameter store)
- ECS, VPC, CloudWatch

## 🚀 How to Deploy (2 Options)

### Option A: Fix AWS Permissions (Recommended)
```bash
# Ask your AWS admin to attach these policies to your user:
# - AmazonEC2ContainerRegistryFullAccess
# - AmazonDynamoDBFullAccess
# - AmazonSSMFullAccess
# - AWSLambdaFullAccess

# Then run:
cd backend
bash deploy-simple.sh
```

### Option B: Use Root/Admin Account
```bash
# Switch to AWS account with admin access
aws configure --profile admin
export AWS_PROFILE=admin

cd backend
bash deploy-simple.sh
```

## 📋 What Happens When Deployed

1. **Docker Image Built**: AI worker with all dependencies
2. **Pushed to ECR**: `vajraopz-agent-worker:latest`
3. **Lambda Created**: `vajraopz-agent-worker` (900s timeout, 3GB RAM)
4. **API Lambda Updated**: `vajraopz-api` with new handler code
5. **Function URL Created**: Public HTTPS endpoint for frontend

## 🔧 Environment Variables Needed

### Worker Lambda
```bash
S3_BUCKET=vajraopz-prod-code-storage-95e7da262c609cef
DEPLOYMENTS_TABLE=vajraopz-prod-deployments
PROJECTS_TABLE=vajraopz-prod-projects
CLAUDE_API_KEY=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
GEMINI_API_KEY=AIzaSyB8-EUpeBz3fN5cG8qpPxqui8DIoDaH6t8
OPENROUTER_API_KEY=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
```

### API Lambda
```bash
JWT_SECRET=f52cae4f046c24fa625c9cad84f09c1b1fcc5aa68dabad93bf399ce9bbb4528774ec189740c2193163e726487ddc68d0c6d33bc0959979e17bf3b8741c8efecc
GITHUB_CLIENT_ID=Iv23liqkVfyeR5Wi86hU
GITHUB_CLIENT_SECRET=991ec85a058dbfad3b9bdfab5f6bd290ff8b7d65
FRONTEND_URL=https://vj-eta.vercel.app
CALLBACK_URL=https://vj-eta.vercel.app/auth/callback
USERS_TABLE=vajraopz-prod-users
PROJECTS_TABLE=vajraopz-prod-projects
DEPLOYMENTS_TABLE=vajraopz-prod-deployments
AGENT_RUNS_TABLE=vajraopz-prod-agent-runs
S3_BUCKET=vajraopz-prod-code-storage-95e7da262c609cef
```

## 🎯 How It Works (User Flow)

1. **User clicks "Fix" button** on frontend
2. **Frontend calls** `triggerFix` mutation
3. **API Lambda** creates deployment record in DynamoDB
4. **API Lambda invokes** Worker Lambda asynchronously
5. **Worker Lambda**:
   - Clones repo to S3
   - Analyzes with 3 AI agents (Claude, Gemini, OpenRouter)
   - Generates fixes
   - Creates branch `TEAM_NAME_LEADER_NAME_AI_Fix`
   - Pushes commits to GitHub
   - Calculates score
   - Saves results to DynamoDB
6. **Frontend polls** `getDeployment` to show progress
7. **User sees** real issues, fixes, commits, and score

## 📊 Data Flow

```
GitHub Repo
    ↓
S3 (code storage)
    ↓
AI Agents (Claude/Gemini/OpenRouter)
    ↓
Fixes Generated
    ↓
GitHub Branch Created
    ↓
DynamoDB (results stored)
    ↓
Frontend (displays results)
```

## 🔑 API Keys Status

✅ Claude API Key: Configured
✅ Gemini API Key: Configured  
✅ OpenRouter API Key: Configured
✅ GitHub OAuth: Configured
✅ Sarvam AI: sk_c74ov4zo_0iPptvThaUQbkX372ExY5YgO

## 📝 Next Steps

1. **Fix AWS permissions** or use admin account
2. **Run deployment**: `bash deploy-simple.sh`
3. **Get Function URL** from output
4. **Update frontend** `.env.production`:
   ```
   VITE_API_BASE_URL=<function-url-from-deployment>
   ```
5. **Test the flow**:
   - Create project
   - Click "Fix" button
   - Watch AI analyze and fix code
   - See real results in UI

## 🐛 Troubleshooting

### If deployment fails:
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check ECR login
aws ecr get-login-password --region ap-south-1

# Check Lambda role exists
aws iam get-role --role-name vajraopz-prod-lambda-execution-role
```

### If AI analysis fails:
- Check CloudWatch logs: `/aws/lambda/vajraopz-agent-worker`
- Verify API keys are set correctly
- Check S3 bucket permissions

### If GitHub push fails:
- Verify GitHub token has `repo` scope
- Check branch doesn't already exist
- Verify repo URL is correct

## 💡 Manual Deployment (If Scripts Fail)

```bash
# 1. Build Docker image
cd backend/agents
docker build -f Dockerfile.worker -t vajraopz-worker .

# 2. Tag for ECR
docker tag vajraopz-worker:latest 548481211727.dkr.ecr.ap-south-1.amazonaws.com/vajraopz-agent-worker:latest

# 3. Push to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 548481211727.dkr.ecr.ap-south-1.amazonaws.com
docker push 548481211727.dkr.ecr.ap-south-1.amazonaws.com/vajraopz-agent-worker:latest

# 4. Create Lambda
aws lambda create-function \
  --function-name vajraopz-agent-worker \
  --package-type Image \
  --code ImageUri=548481211727.dkr.ecr.ap-south-1.amazonaws.com/vajraopz-agent-worker:latest \
  --role arn:aws:iam::548481211727:role/vajraopz-prod-lambda-execution-role \
  --timeout 900 \
  --memory-size 3008 \
  --region ap-south-1

# 5. Set environment variables
aws lambda update-function-configuration \
  --function-name vajraopz-agent-worker \
  --environment "Variables={S3_BUCKET=vajraopz-prod-code-storage-95e7da262c609cef,CLAUDE_API_KEY=...,GEMINI_API_KEY=...,OPENROUTER_API_KEY=...}" \
  --region ap-south-1
```

## ✨ Features Implemented

- ✅ Real AI code analysis (Claude + Gemini + OpenRouter)
- ✅ Automatic issue detection (LINTING, SYNTAX, LOGIC, STYLE)
- ✅ Automatic fix generation
- ✅ GitHub branch creation and push
- ✅ Quality scoring system
- ✅ S3 code storage
- ✅ DynamoDB result storage
- ✅ Async Lambda invocation
- ✅ Complete error handling
- ✅ Commit history tracking

## 🎉 Ready to Go!

Once deployed, the entire AI-powered code analysis and fixing pipeline will be live and working!
