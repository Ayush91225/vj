#!/bin/bash

set -e

echo "🚀 VajraOpz Complete Deployment Script"
echo "========================================"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check required variables
if [ -z "$CLAUDE_API_KEY" ] && [ -z "$GEMINI_API_KEY" ] && [ -z "$OPENROUTER_API_KEY" ]; then
    echo "⚠️  WARNING: No AI API keys found!"
    echo "Please set at least one of: CLAUDE_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Configuration
AWS_REGION=${AWS_REGION:-"ap-south-1"}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "📍 Region: $AWS_REGION"
echo "🔑 Account: $AWS_ACCOUNT_ID"
echo ""

# Step 1: Deploy Infrastructure
echo "📦 Step 1/4: Deploying Infrastructure with Terraform..."
cd infrastructure

terraform init -upgrade
terraform apply -auto-approve \
    -var="aws_region=$AWS_REGION" \
    -var="project_name=vajraopz" \
    -var="environment=prod"

# Get outputs
S3_BUCKET=$(terraform output -raw s3_bucket_name)
LAMBDA_ROLE_ARN=$(terraform output -raw lambda_role_arn)

echo "✅ Infrastructure deployed"
echo "   S3 Bucket: $S3_BUCKET"
echo "   Lambda Role: $LAMBDA_ROLE_ARN"
cd ..

# Step 2: Deploy AI Agent Worker Lambda
echo ""
echo "🤖 Step 2/4: Deploying AI Agent Worker..."
cd agents

# Build and push Docker image
WORKER_REPO="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/vajraopz-agent-worker"

echo "Creating ECR repository..."
aws ecr describe-repositories --repository-names vajraopz-agent-worker --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository --repository-name vajraopz-agent-worker --region $AWS_REGION

echo "Building Docker image..."
docker build -f Dockerfile.worker -t $WORKER_REPO:latest .

echo "Pushing to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $WORKER_REPO
docker push $WORKER_REPO:latest

# Create/Update Lambda function
FUNCTION_NAME="vajraopz-agent-worker"

if aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION 2>/dev/null; then
    echo "Updating Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --image-uri $WORKER_REPO:latest \
        --region $AWS_REGION
    
    sleep 5
    
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --timeout 900 \
        --memory-size 3008 \
        --environment "Variables={
            S3_BUCKET=$S3_BUCKET,
            DEPLOYMENTS_TABLE=vajraopz-prod-deployments,
            PROJECTS_TABLE=vajraopz-prod-projects,
            CLAUDE_API_KEY=$CLAUDE_API_KEY,
            GEMINI_API_KEY=$GEMINI_API_KEY,
            OPENROUTER_API_KEY=$OPENROUTER_API_KEY
        }" \
        --region $AWS_REGION
else
    echo "Creating Lambda function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --package-type Image \
        --code ImageUri=$WORKER_REPO:latest \
        --role $LAMBDA_ROLE_ARN \
        --timeout 900 \
        --memory-size 3008 \
        --region $AWS_REGION \
        --environment "Variables={
            S3_BUCKET=$S3_BUCKET,
            DEPLOYMENTS_TABLE=vajraopz-prod-deployments,
            PROJECTS_TABLE=vajraopz-prod-projects,
            CLAUDE_API_KEY=$CLAUDE_API_KEY,
            GEMINI_API_KEY=$GEMINI_API_KEY,
            OPENROUTER_API_KEY=$OPENROUTER_API_KEY
        }"
fi

echo "✅ AI Agent Worker deployed"
cd ..

# Step 3: Deploy API Lambda
echo ""
echo "⚡ Step 3/4: Deploying API Lambda..."
cd lambda/api

# Create deployment package
echo "Creating deployment package..."
rm -rf package deployment.zip
mkdir -p package

# Install dependencies
pip3 install -r requirements.txt -t package/ --upgrade

# Copy handler
cp handler.py package/

# Create zip
cd package
zip -r ../deployment.zip . -q
cd ..

# Create/Update Lambda function
API_FUNCTION_NAME="vajraopz-api"

if aws lambda get-function --function-name $API_FUNCTION_NAME --region $AWS_REGION 2>/dev/null; then
    echo "Updating API Lambda..."
    aws lambda update-function-code \
        --function-name $API_FUNCTION_NAME \
        --zip-file fileb://deployment.zip \
        --region $AWS_REGION
    
    sleep 5
    
    aws lambda update-function-configuration \
        --function-name $API_FUNCTION_NAME \
        --timeout 30 \
        --memory-size 512 \
        --environment "Variables={
            JWT_SECRET=$JWT_SECRET,
            GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID,
            GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET,
            FRONTEND_URL=$FRONTEND_URL,
            CALLBACK_URL=$CALLBACK_URL,
            USERS_TABLE=vajraopz-prod-users,
            PROJECTS_TABLE=vajraopz-prod-projects,
            DEPLOYMENTS_TABLE=vajraopz-prod-deployments,
            AGENT_RUNS_TABLE=vajraopz-prod-agent-runs,
            S3_BUCKET=$S3_BUCKET
        }" \
        --region $AWS_REGION
else
    echo "Creating API Lambda..."
    aws lambda create-function \
        --function-name $API_FUNCTION_NAME \
        --runtime python3.11 \
        --role $LAMBDA_ROLE_ARN \
        --handler handler.lambda_handler \
        --zip-file fileb://deployment.zip \
        --timeout 30 \
        --memory-size 512 \
        --region $AWS_REGION \
        --environment "Variables={
            JWT_SECRET=$JWT_SECRET,
            GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID,
            GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET,
            FRONTEND_URL=$FRONTEND_URL,
            CALLBACK_URL=$CALLBACK_URL,
            USERS_TABLE=vajraopz-prod-users,
            PROJECTS_TABLE=vajraopz-prod-projects,
            DEPLOYMENTS_TABLE=vajraopz-prod-deployments,
            AGENT_RUNS_TABLE=vajraopz-prod-agent-runs,
            S3_BUCKET=$S3_BUCKET
        }"
fi

# Create Function URL
echo "Creating Function URL..."
FUNCTION_URL=$(aws lambda create-function-url-config \
    --function-name $API_FUNCTION_NAME \
    --auth-type NONE \
    --cors "AllowOrigins=*,AllowMethods=*,AllowHeaders=*" \
    --region $AWS_REGION \
    --query 'FunctionUrl' \
    --output text 2>/dev/null || \
aws lambda get-function-url-config \
    --function-name $API_FUNCTION_NAME \
    --region $AWS_REGION \
    --query 'FunctionUrl' \
    --output text)

# Add public invoke permission
aws lambda add-permission \
    --function-name $API_FUNCTION_NAME \
    --statement-id FunctionURLAllowPublicAccess \
    --action lambda:InvokeFunctionUrl \
    --principal "*" \
    --function-url-auth-type NONE \
    --region $AWS_REGION 2>/dev/null || echo "Permission already exists"

echo "✅ API Lambda deployed"
echo "   Function URL: $FUNCTION_URL"
cd ../..

# Step 4: Update GitHub OAuth parameters
echo ""
echo "🔑 Step 4/4: Updating GitHub OAuth parameters..."

if [ -n "$GITHUB_CLIENT_ID" ] && [ -n "$GITHUB_CLIENT_SECRET" ]; then
    aws ssm put-parameter \
        --name "/vajraopz/prod/github/client_id" \
        --value "$GITHUB_CLIENT_ID" \
        --type "String" \
        --overwrite \
        --region $AWS_REGION
    
    aws ssm put-parameter \
        --name "/vajraopz/prod/github/client_secret" \
        --value "$GITHUB_CLIENT_SECRET" \
        --type "SecureString" \
        --overwrite \
        --region $AWS_REGION
    
    echo "✅ GitHub OAuth parameters updated"
else
    echo "⚠️  Skipping GitHub OAuth (credentials not found)"
fi

# Summary
echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "📋 Deployment Summary:"
echo "   Region: $AWS_REGION"
echo "   S3 Bucket: $S3_BUCKET"
echo "   API URL: $FUNCTION_URL"
echo "   Worker Function: $FUNCTION_NAME"
echo "   API Function: $API_FUNCTION_NAME"
echo ""
echo "📝 Next Steps:"
echo "   1. Update frontend VITE_API_BASE_URL to: $FUNCTION_URL"
echo "   2. Update GitHub OAuth callback URL to: https://your-frontend-url/auth/callback"
echo "   3. Test the deployment by creating a project"
echo ""
echo "🔧 To update AI API keys:"
echo "   aws lambda update-function-configuration \\"
echo "     --function-name $FUNCTION_NAME \\"
echo "     --environment Variables=\"{CLAUDE_API_KEY=your_key,...}\" \\"
echo "     --region $AWS_REGION"
echo ""
