#!/bin/bash

# VajraOpz Backend Deployment to AWS Lambda
set -e

echo "======================================"
echo "  VajraOpz Backend Deployment"
echo "======================================"

cd backend/lambda/api

# Create deployment package
echo "📦 Creating deployment package..."
rm -rf package deployment.zip
mkdir -p package

# Install dependencies
pip install -r requirements.txt -t package/

# Copy handler
cp handler.py package/

# Create zip
cd package
zip -r ../deployment.zip . -q
cd ..

echo "✅ Deployment package created: deployment.zip"
echo ""
echo "Next steps:"
echo "1. Upload deployment.zip to AWS Lambda"
echo "2. Set environment variables in Lambda console"
echo "3. Configure API Gateway"
echo ""
echo "Or use AWS CLI:"
echo "aws lambda update-function-code --function-name vajraopz-prod-api --zip-file fileb://deployment.zip"
