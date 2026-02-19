#!/bin/bash

set -e

echo "🛠️ Setting up VajraOpz for Development"
echo "====================================="

# Configuration for development
PROJECT_NAME="vajraopz"
ENVIRONMENT="dev"
AWS_REGION="us-east-1"

# Check if GitHub OAuth is configured
if [ -z "$GITHUB_CLIENT_ID" ] || [ -z "$GITHUB_CLIENT_SECRET" ]; then
    echo "⚠️  GitHub OAuth not configured for development"
    echo ""
    echo "Please create a GitHub OAuth App with these settings:"
    echo "  - Application name: VajraOpz Dev"
    echo "  - Homepage URL: http://localhost:3000"
    echo "  - Authorization callback URL: http://localhost:3000/auth/callback"
    echo ""
    echo "Then set environment variables:"
    echo "  export GITHUB_CLIENT_ID=your_dev_client_id"
    echo "  export GITHUB_CLIENT_SECRET=your_dev_client_secret"
    echo ""
    read -p "Press Enter after setting up GitHub OAuth..."
fi

# Step 1: Deploy minimal AWS infrastructure for development
echo "📦 Deploying development infrastructure..."
cd infrastructure

terraform init

# Deploy with development settings
terraform apply -auto-approve \
  -var="project_name=$PROJECT_NAME" \
  -var="environment=$ENVIRONMENT" \
  -var="aws_region=$AWS_REGION"

# Get outputs
S3_BUCKET_NAME=$(terraform output -raw s3_bucket_name)

echo "✅ Development infrastructure deployed"
echo "S3 Bucket: $S3_BUCKET_NAME"

cd ..

# Step 2: Set up local Lambda development
echo "🐍 Setting up local Lambda development..."
cd lambda/api

# Install dependencies
pip install -r requirements.txt

# Create local development server
cat > dev_server.py << 'EOF'
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from handler import lambda_handler

app = Flask(__name__)
CORS(app)

@app.route('/graphql', methods=['POST', 'OPTIONS'])
def graphql():
    if request.method == 'OPTIONS':
        return '', 200
    
    # Convert Flask request to Lambda event format
    event = {
        'body': json.dumps(request.get_json()),
        'headers': dict(request.headers),
        'httpMethod': request.method,
        'path': '/graphql'
    }
    
    # Call Lambda handler
    response = lambda_handler(event, {})
    
    return jsonify(json.loads(response['body'])), response['statusCode']

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
EOF

echo "✅ Local Lambda server created"

cd ../..

# Step 3: Update GitHub OAuth parameters for development
echo "🔑 Setting up GitHub OAuth for development..."

aws ssm put-parameter \
    --name "/$PROJECT_NAME/$ENVIRONMENT/github/client_id" \
    --value "$GITHUB_CLIENT_ID" \
    --type "String" \
    --overwrite \
    --region $AWS_REGION

aws ssm put-parameter \
    --name "/$PROJECT_NAME/$ENVIRONMENT/github/client_secret" \
    --value "$GITHUB_CLIENT_SECRET" \
    --type "SecureString" \
    --overwrite \
    --region $AWS_REGION

echo "✅ GitHub OAuth parameters set for development"

# Step 4: Create development environment file
echo "📝 Creating development environment..."

cat > .env.development << EOF
# Development Environment Variables
VITE_API_BASE_URL=http://localhost:3001/graphql
VITE_ENVIRONMENT=development
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=true

# AWS Configuration
AWS_REGION=$AWS_REGION
S3_BUCKET=$S3_BUCKET_NAME

# DynamoDB Tables
USERS_TABLE=$PROJECT_NAME-$ENVIRONMENT-users
PROJECTS_TABLE=$PROJECT_NAME-$ENVIRONMENT-projects
DEPLOYMENTS_TABLE=$PROJECT_NAME-$ENVIRONMENT-deployments
AGENT_RUNS_TABLE=$PROJECT_NAME-$ENVIRONMENT-agent-runs

# GitHub OAuth
GITHUB_CLIENT_ID_PARAM=/$PROJECT_NAME/$ENVIRONMENT/github/client_id
GITHUB_CLIENT_SECRET_PARAM=/$PROJECT_NAME/$ENVIRONMENT/github/client_secret
EOF

echo "✅ Development environment file created"

# Step 5: Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo ""
echo "🎉 Development setup completed!"
echo ""
echo "To start development:"
echo "1. Start backend server:"
echo "   cd backend/lambda/api && python dev_server.py"
echo ""
echo "2. Start frontend (in another terminal):"
echo "   npm run dev"
echo ""
echo "3. Access the app at: http://localhost:3000"
echo ""
echo "Development URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001/graphql"
echo "- GitHub OAuth Callback: http://localhost:3000/auth/callback"