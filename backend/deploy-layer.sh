#!/bin/bash

set -e

echo "🚀 VajraOpz Deployment (Lambda Layers)"
echo "======================================"

if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

AWS_REGION=${AWS_REGION:-"ap-south-1"}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
S3_BUCKET="vajraopz-prod-code-storage-95e7da262c609cef"
LAMBDA_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/vajraopz-prod-lambda-execution-role"

# Create dependencies layer
echo "📦 Creating dependencies layer..."
cd agents
rm -rf python layer.zip
mkdir -p python

echo "Installing dependencies..."
pip3 install -r requirements_simple.txt -t python/ --upgrade --platform manylinux2014_x86_64 --only-binary=:all: 2>/dev/null || pip3 install -r requirements_simple.txt -t python/ --upgrade

echo "Creating layer zip..."
zip -r layer.zip python -q

# Upload layer
echo "Publishing layer to AWS..."
LAYER_VERSION=$(aws lambda publish-layer-version \
    --layer-name vajraopz-dependencies \
    --zip-file fileb://layer.zip \
    --compatible-runtimes python3.11 python3.12 \
    --region $AWS_REGION \
    --query 'Version' \
    --output text)

LAYER_ARN="arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT_ID}:layer:vajraopz-dependencies:${LAYER_VERSION}"
echo "✅ Layer version: $LAYER_VERSION"
echo "✅ Layer ARN: $LAYER_ARN"

# Create worker function package (code only)
echo "Creating worker package..."
rm -rf package worker.zip
mkdir -p package
cp agent_worker.py package/
cp dynamodb_helper.py package/ 2>/dev/null || true
cp github_integration.py package/ 2>/dev/null || true

cd package
zip -r ../worker.zip . -q
cd ..

# Deploy worker
FUNCTION_NAME="vajraopz-agent-worker"

echo "Deploying worker Lambda..."
if aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION 2>/dev/null; then
    echo "Updating existing worker..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://worker.zip \
        --region $AWS_REGION > /dev/null
    
    echo "Waiting for update to complete..."
    aws lambda wait function-updated --function-name $FUNCTION_NAME --region $AWS_REGION
    
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --layers "$LAYER_ARN" \
        --timeout 900 \
        --memory-size 3008 \
        --environment "Variables={S3_BUCKET=$S3_BUCKET,DEPLOYMENTS_TABLE=vajraopz-prod-deployments,PROJECTS_TABLE=vajraopz-prod-projects,CLAUDE_API_KEY=$CLAUDE_API_KEY,GEMINI_API_KEY=$GEMINI_API_KEY,OPENROUTER_API_KEY=$OPENROUTER_API_KEY}" \
        --region $AWS_REGION > /dev/null
else
    echo "Creating new worker..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime python3.11 \
        --role $LAMBDA_ROLE_ARN \
        --handler agent_worker.lambda_handler \
        --zip-file fileb://worker.zip \
        --layers "$LAYER_ARN" \
        --timeout 900 \
        --memory-size 3008 \
        --region $AWS_REGION \
        --environment "Variables={S3_BUCKET=$S3_BUCKET,DEPLOYMENTS_TABLE=vajraopz-prod-deployments,PROJECTS_TABLE=vajraopz-prod-projects,CLAUDE_API_KEY=$CLAUDE_API_KEY,GEMINI_API_KEY=$GEMINI_API_KEY,OPENROUTER_API_KEY=$OPENROUTER_API_KEY}" > /dev/null
fi

echo "✅ Worker deployed!"
cd ..

# Deploy API
echo ""
echo "⚡ Deploying API..."
cd lambda/api

echo "Creating API package..."
rm -rf package deployment.zip
mkdir -p package

echo "Installing API dependencies..."
pip3 install -r requirements.txt -t package/ --upgrade --platform manylinux2014_x86_64 --only-binary=:all: 2>/dev/null || pip3 install -r requirements.txt -t package/ --upgrade
cp handler.py package/

cd package
zip -r ../deployment.zip . -q
cd ..

API_FUNCTION_NAME="vajraopz-api"

echo "Deploying API Lambda..."
if aws lambda get-function --function-name $API_FUNCTION_NAME --region $AWS_REGION 2>/dev/null; then
    echo "Updating existing API..."
    aws lambda update-function-code \
        --function-name $API_FUNCTION_NAME \
        --zip-file fileb://deployment.zip \
        --region $AWS_REGION > /dev/null
    
    echo "Waiting for update to complete..."
    aws lambda wait function-updated --function-name $API_FUNCTION_NAME --region $AWS_REGION
    
    aws lambda update-function-configuration \
        --function-name $API_FUNCTION_NAME \
        --timeout 30 \
        --memory-size 512 \
        --environment "Variables={JWT_SECRET=$JWT_SECRET,GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET,FRONTEND_URL=https://vj-eta.vercel.app,CALLBACK_URL=https://vj-eta.vercel.app/auth/callback,USERS_TABLE=vajraopz-prod-users,PROJECTS_TABLE=vajraopz-prod-projects,DEPLOYMENTS_TABLE=vajraopz-prod-deployments,AGENT_RUNS_TABLE=vajraopz-prod-agent-runs,S3_BUCKET=$S3_BUCKET}" \
        --region $AWS_REGION > /dev/null
else
    echo "Creating new API..."
    aws lambda create-function \
        --function-name $API_FUNCTION_NAME \
        --runtime python3.11 \
        --role $LAMBDA_ROLE_ARN \
        --handler handler.lambda_handler \
        --zip-file fileb://deployment.zip \
        --timeout 30 \
        --memory-size 512 \
        --region $AWS_REGION \
        --environment "Variables={JWT_SECRET=$JWT_SECRET,GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET,FRONTEND_URL=https://vj-eta.vercel.app,CALLBACK_URL=https://vj-eta.vercel.app/auth/callback,USERS_TABLE=vajraopz-prod-users,PROJECTS_TABLE=vajraopz-prod-projects,DEPLOYMENTS_TABLE=vajraopz-prod-deployments,AGENT_RUNS_TABLE=vajraopz-prod-agent-runs,S3_BUCKET=$S3_BUCKET}" > /dev/null
fi

echo "Configuring Function URL..."
FUNCTION_URL=$(aws lambda get-function-url-config \
    --function-name $API_FUNCTION_NAME \
    --region $AWS_REGION \
    --query 'FunctionUrl' \
    --output text 2>/dev/null || echo "")

if [ -z "$FUNCTION_URL" ]; then
    echo "Creating Function URL..."
    FUNCTION_URL=$(aws lambda create-function-url-config \
        --function-name $API_FUNCTION_NAME \
        --auth-type NONE \
        --cors "AllowOrigins=*,AllowMethods=*,AllowHeaders=*,MaxAge=86400" \
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
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "🔗 API URL: $FUNCTION_URL"
echo "🤖 Worker: $FUNCTION_NAME"
echo "📦 Layer: vajraopz-dependencies:$LAYER_VERSION"
echo ""
echo "📝 Update frontend .env.production:"
echo "VITE_API_BASE_URL=$FUNCTION_URL"
