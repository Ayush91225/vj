#!/bin/bash

set -e

echo "🚀 VajraOpz AI Worker Deployment (ZIP-based)"
echo "============================================="

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

AWS_REGION=${AWS_REGION:-"ap-south-1"}
S3_BUCKET="vajraopz-prod-code-storage-95e7da262c609cef"
LAMBDA_ROLE_ARN="arn:aws:iam::548481211727:role/vajraopz-prod-lambda-execution-role"

echo "📦 Building Lambda package..."
cd agents

rm -rf package worker.zip
mkdir -p package

# Install dependencies
pip3 install -r requirements_simple.txt -t package/ --upgrade

# Copy worker code
cp agent_worker.py package/

# Create zip
cd package
zip -r ../worker.zip . -q
cd ..

echo "✅ Package created: worker.zip"

# Deploy Lambda
FUNCTION_NAME="vajraopz-agent-worker"

if aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION 2>/dev/null; then
    echo "Updating function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://worker.zip \
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
    echo "Creating function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime python3.11 \
        --role $LAMBDA_ROLE_ARN \
        --handler agent_worker.lambda_handler \
        --zip-file fileb://worker.zip \
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

echo "✅ Worker deployed!"
cd ..

# Deploy API Lambda
echo ""
echo "⚡ Deploying API Lambda..."
cd lambda/api

rm -rf package deployment.zip
mkdir -p package

pip3 install -r requirements.txt -t package/ --upgrade
cp handler.py package/

cd package
zip -r ../deployment.zip . -q
cd ..

API_FUNCTION_NAME="vajraopz-api"

if aws lambda get-function --function-name $API_FUNCTION_NAME --region $AWS_REGION 2>/dev/null; then
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
            FRONTEND_URL=https://vj-eta.vercel.app,
            CALLBACK_URL=https://vj-eta.vercel.app/auth/callback,
            USERS_TABLE=vajraopz-prod-users,
            PROJECTS_TABLE=vajraopz-prod-projects,
            DEPLOYMENTS_TABLE=vajraopz-prod-deployments,
            AGENT_RUNS_TABLE=vajraopz-prod-agent-runs,
            S3_BUCKET=$S3_BUCKET
        }" \
        --region $AWS_REGION
else
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
            FRONTEND_URL=https://vj-eta.vercel.app,
            CALLBACK_URL=https://vj-eta.vercel.app/auth/callback,
            USERS_TABLE=vajraopz-prod-users,
            PROJECTS_TABLE=vajraopz-prod-projects,
            DEPLOYMENTS_TABLE=vajraopz-prod-deployments,
            AGENT_RUNS_TABLE=vajraopz-prod-agent-runs,
            S3_BUCKET=$S3_BUCKET
        }"
fi

FUNCTION_URL=$(aws lambda get-function-url-config \
    --function-name $API_FUNCTION_NAME \
    --region $AWS_REGION \
    --query 'FunctionUrl' \
    --output text 2>/dev/null || echo "")

if [ -z "$FUNCTION_URL" ]; then
    FUNCTION_URL=$(aws lambda create-function-url-config \
        --function-name $API_FUNCTION_NAME \
        --auth-type NONE \
        --cors "AllowOrigins=*,AllowMethods=*,AllowHeaders=*" \
        --region $AWS_REGION \
        --query 'FunctionUrl' \
        --output text)
    
    aws lambda add-permission \
        --function-name $API_FUNCTION_NAME \
        --statement-id FunctionURLAllowPublicAccess \
        --action lambda:InvokeFunctionUrl \
        --principal "*" \
        --function-url-auth-type NONE \
        --region $AWS_REGION 2>/dev/null || true
fi

echo "✅ API deployed!"
cd ../..

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "API URL: $FUNCTION_URL"
echo "Worker: $FUNCTION_NAME"
echo ""
echo "Update frontend:"
echo "VITE_API_BASE_URL=$FUNCTION_URL"
