#!/bin/bash

# VajraOpz - AWS Lambda Deployment Script
# This creates the deployment package for AWS Lambda

set -e

echo "======================================"
echo "  Creating AWS Lambda Package"
echo "======================================"

cd "$(dirname "$0")/lambda/api"

# Clean up
rm -rf package deployment.zip

# Create package directory
mkdir -p package

echo "📦 Installing dependencies..."
pip3 install -r requirements.txt -t package/ --quiet

echo "📄 Copying handler..."
cp handler.py package/

echo "🗜️  Creating zip file..."
cd package
zip -r ../deployment.zip . -q
cd ..

echo ""
echo "✅ Deployment package created: backend/lambda/api/deployment.zip"
echo ""
echo "======================================"
echo "  Next: Deploy to AWS Lambda"
echo "======================================"
echo ""
echo "Option 1: AWS Console (Easiest)"
echo "  1. Go to: https://console.aws.amazon.com/lambda"
echo "  2. Create function: vajraopz-prod-api"
echo "  3. Runtime: Python 3.11"
echo "  4. Upload: deployment.zip"
echo "  5. Set environment variables (see below)"
echo "  6. Create API Gateway trigger"
echo ""
echo "Option 2: AWS CLI"
echo "  aws lambda create-function \\"
echo "    --function-name vajraopz-prod-api \\"
echo "    --runtime python3.11 \\"
echo "    --role YOUR_LAMBDA_ROLE_ARN \\"
echo "    --handler handler.lambda_handler \\"
echo "    --zip-file fileb://deployment.zip \\"
echo "    --timeout 30 \\"
echo "    --memory-size 512"
echo ""
echo "Environment Variables to Set:"
echo "  IS_LOCAL=false"
echo "  GITHUB_CLIENT_ID=Iv23liqkVfyeR5Wi86hU"
echo "  GITHUB_CLIENT_SECRET=991ec85a058dbfad3b9bdfab5f6bd290ff8b7d65"
echo "  FRONTEND_URL=https://vj-eta.vercel.app"
echo "  CALLBACK_URL=https://vj-eta.vercel.app/auth/callback"
echo "  JWT_SECRET=<generate with: openssl rand -hex 32>"
echo ""
echo "======================================"
