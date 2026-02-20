#!/bin/bash

set -e

echo "🤖 Deploying VajraOpz AI Agent Worker..."

# Configuration
AWS_REGION=${AWS_REGION:-"ap-south-1"}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
FUNCTION_NAME="vajraopz-agent-worker"
ECR_REPO="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/vajraopz-agent-worker"

# Step 1: Create ECR repository if it doesn't exist
echo "📦 Creating ECR repository..."
aws ecr describe-repositories --repository-names vajraopz-agent-worker --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository --repository-name vajraopz-agent-worker --region $AWS_REGION

# Step 2: Build and push Docker image
echo "🐳 Building Docker image..."
docker build -f Dockerfile.worker -t $ECR_REPO:latest .

echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO

echo "📤 Pushing image to ECR..."
docker push $ECR_REPO:latest

# Step 3: Create or update Lambda function
echo "⚡ Creating/updating Lambda function..."

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION 2>/dev/null; then
    echo "Updating existing function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --image-uri $ECR_REPO:latest \
        --region $AWS_REGION
else
    echo "Creating new function..."
    
    # Get Lambda execution role ARN
    ROLE_ARN=$(aws iam get-role --role-name vajraopz-prod-lambda-execution-role --query 'Role.Arn' --output text 2>/dev/null || echo "")
    
    if [ -z "$ROLE_ARN" ]; then
        echo "❌ Lambda execution role not found. Run terraform apply first."
        exit 1
    fi
    
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --package-type Image \
        --code ImageUri=$ECR_REPO:latest \
        --role $ROLE_ARN \
        --timeout 900 \
        --memory-size 2048 \
        --region $AWS_REGION \
        --environment "Variables={
            S3_BUCKET=vajraopz-prod-code-storage,
            DEPLOYMENTS_TABLE=vajraopz-prod-deployments,
            PROJECTS_TABLE=vajraopz-prod-projects,
            CLAUDE_API_KEY=$CLAUDE_API_KEY,
            GEMINI_API_KEY=$GEMINI_API_KEY,
            OPENROUTER_API_KEY=$OPENROUTER_API_KEY
        }"
fi

# Step 4: Update environment variables
echo "🔧 Updating environment variables..."
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment "Variables={
        S3_BUCKET=vajraopz-prod-code-storage,
        DEPLOYMENTS_TABLE=vajraopz-prod-deployments,
        PROJECTS_TABLE=vajraopz-prod-projects,
        CLAUDE_API_KEY=$CLAUDE_API_KEY,
        GEMINI_API_KEY=$GEMINI_API_KEY,
        OPENROUTER_API_KEY=$OPENROUTER_API_KEY
    }" \
    --region $AWS_REGION

echo "✅ Agent worker deployed successfully!"
echo "Function: $FUNCTION_NAME"
echo "Image: $ECR_REPO:latest"
