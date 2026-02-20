#!/bin/bash

set -e

echo "🚀 VajraOpz Optimized Deployment"
echo "=================================="

if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

AWS_REGION=${AWS_REGION:-"ap-south-1"}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
S3_BUCKET="vajraopz-prod-code-storage-95e7da262c609cef"
LAMBDA_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/vajraopz-prod-lambda-execution-role"

# ===== WORKER LAMBDA (with dependencies included) =====
echo ""
echo "🤖 Deploying Worker Lambda..."
cd agents

rm -rf package worker.zip
mkdir -p package

echo "Installing minimal dependencies..."
pip3 install boto3 anthropic google-generativeai requests -t package/ --upgrade --platform manylinux2014_x86_64 --only-binary=:all: 2>/dev/null || pip3 install boto3 anthropic google-generativeai requests -t package/ --upgrade

# Copy worker code
cp agent_worker.py package/

# Remove unnecessary files to reduce size
cd package
find . -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.pyo" -delete 2>/dev/null || true
find . -name "*.dist-info" -exec rm -rf {} + 2>/dev/null || true

zip -r ../worker.zip . -q -x "*.pyc" "*.pyo" "*/__pycache__/*"
cd ..

WORKER_FUNCTION="vajraopz-agent-worker"

if aws lambda get-function --function-name $WORKER_FUNCTION --region $AWS_REGION 2>/dev/null; then
    echo "Updating worker..."
    aws lambda update-function-code \
        --function-name $WORKER_FUNCTION \
        --zip-file fileb://worker.zip \
        --region $AWS_REGION > /dev/null
    
    aws lambda wait function-updated --function-name $WORKER_FUNCTION --region $AWS_REGION
    
    aws lambda update-function-configuration \
        --function-name $WORKER_FUNCTION \
        --timeout 900 \
        --memory-size 3008 \
        --environment "Variables={S3_BUCKET=$S3_BUCKET,DEPLOYMENTS_TABLE=vajraopz-prod-deployments,PROJECTS_TABLE=vajraopz-prod-projects,CLAUDE_API_KEY=$CLAUDE_API_KEY,GEMINI_API_KEY=$GEMINI_API_KEY,OPENROUTER_API_KEY=$OPENROUTER_API_KEY}" \
        --region $AWS_REGION > /dev/null
else
    echo "Creating worker..."
    aws lambda create-function \
        --function-name $WORKER_FUNCTION \
        --runtime python3.11 \
        --role $LAMBDA_ROLE_ARN \
        --handler agent_worker.lambda_handler \
        --zip-file fileb://worker.zip \
        --timeout 900 \
        --memory-size 3008 \
        --region $AWS_REGION \
        --environment "Variables={S3_BUCKET=$S3_BUCKET,DEPLOYMENTS_TABLE=vajraopz-prod-deployments,PROJECTS_TABLE=vajraopz-prod-projects,CLAUDE_API_KEY=$CLAUDE_API_KEY,GEMINI_API_KEY=$GEMINI_API_KEY,OPENROUTER_API_KEY=$OPENROUTER_API_KEY}" > /dev/null
fi

echo "✅ Worker deployed!"
cd ..

# ===== API LAMBDA =====
echo ""
echo "⚡ Deploying API Lambda..."
cd lambda/api

rm -rf package deployment.zip
mkdir -p package

echo "Installing API dependencies..."
pip3 install boto3 requests -t package/ --upgrade --platform manylinux2014_x86_64 --only-binary=:all: 2>/dev/null || pip3 install boto3 requests -t package/ --upgrade

cp handler.py package/

cd package
find . -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.dist-info" -exec rm -rf {} + 2>/dev/null || true

zip -r ../deployment.zip . -q
cd ..

API_FUNCTION="vajraopz-api"

if aws lambda get-function --function-name $API_FUNCTION --region $AWS_REGION 2>/dev/null; then
    echo "Updating API..."
    aws lambda update-function-code \
        --function-name $API_FUNCTION \
        --zip-file fileb://deployment.zip \
        --region $AWS_REGION > /dev/null
    
    aws lambda wait function-updated --function-name $API_FUNCTION --region $AWS_REGION
    
    aws lambda update-function-configuration \
        --function-name $API_FUNCTION \
        --timeout 30 \
        --memory-size 512 \
        --environment "Variables={JWT_SECRET=$JWT_SECRET,GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET,FRONTEND_URL=https://vj-eta.vercel.app,CALLBACK_URL=https://vj-eta.vercel.app/auth/callback,USERS_TABLE=vajraopz-prod-users,PROJECTS_TABLE=vajraopz-prod-projects,DEPLOYMENTS_TABLE=vajraopz-prod-deployments,AGENT_RUNS_TABLE=vajraopz-prod-agent-runs,S3_BUCKET=$S3_BUCKET}" \
        --region $AWS_REGION > /dev/null
else
    echo "Creating API..."
    aws lambda create-function \
        --function-name $API_FUNCTION \
        --runtime python3.11 \
        --role $LAMBDA_ROLE_ARN \
        --handler handler.lambda_handler \
        --zip-file fileb://deployment.zip \
        --timeout 30 \
        --memory-size 512 \
        --region $AWS_REGION \
        --environment "Variables={JWT_SECRET=$JWT_SECRET,GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET,FRONTEND_URL=https://vj-eta.vercel.app,CALLBACK_URL=https://vj-eta.vercel.app/auth/callback,USERS_TABLE=vajraopz-prod-users,PROJECTS_TABLE=vajraopz-prod-projects,DEPLOYMENTS_TABLE=vajraopz-prod-deployments,AGENT_RUNS_TABLE=vajraopz-prod-agent-runs,S3_BUCKET=$S3_BUCKET}" > /dev/null
fi

# Configure Function URL
FUNCTION_URL=$(aws lambda get-function-url-config \
    --function-name $API_FUNCTION \
    --region $AWS_REGION \
    --query 'FunctionUrl' \
    --output text 2>/dev/null || echo "")

if [ -z "$FUNCTION_URL" ]; then
    echo "Creating Function URL..."
    FUNCTION_URL=$(aws lambda create-function-url-config \
        --function-name $API_FUNCTION \
        --auth-type NONE \
        --cors "AllowOrigins=*,AllowMethods=*,AllowHeaders=*,MaxAge=86400" \
        --region $AWS_REGION \
        --query 'FunctionUrl' \
        --output text)
    
    aws lambda add-permission \
        --function-name $API_FUNCTION \
        --statement-id FunctionURLAllowPublicAccess \
        --action lambda:InvokeFunctionUrl \
        --principal "*" \
        --function-url-auth-type NONE \
        --region $AWS_REGION 2>/dev/null || true
fi

echo "✅ API deployed!"
cd ../..

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "🔗 API URL: $FUNCTION_URL"
echo "🤖 Worker: $WORKER_FUNCTION"
echo ""
echo "📝 Update frontend .env.production:"
echo "VITE_API_BASE_URL=$FUNCTION_URL"
echo ""
