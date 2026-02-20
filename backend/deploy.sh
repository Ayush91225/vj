#!/bin/bash

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
PROJECT_NAME="vajraopz"
ENVIRONMENT="prod"
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_PROFILE=${AWS_PROFILE:-"default"}

export AWS_PROFILE=$AWS_PROFILE

echo "🚀 Deploying VajraOpz Backend Infrastructure (Profile: $AWS_PROFILE)..."

# Step 1: Deploy Terraform infrastructure
echo "📦 Deploying Terraform infrastructure..."
cd infrastructure

terraform init
terraform apply -auto-approve \
    -var="aws_profile=$AWS_PROFILE" \
    -var="project_name=$PROJECT_NAME" \
    -var="environment=$ENVIRONMENT" \
    -var="aws_region=$AWS_REGION"

# Get outputs
VPC_ID=$(terraform output -raw vpc_id)
SUBNET_IDS=$(terraform output -json subnet_ids | jq -r 'join(",")')
SECURITY_GROUP_ID=$(terraform output -raw security_group_id)
ECS_CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
S3_BUCKET_NAME=$(terraform output -raw s3_bucket_name)

echo "✅ Infrastructure deployed successfully"
cd ..

# Step 2: Build and push Docker image
echo "🐳 Building and pushing Docker image..."

ECR_REPO=$(aws ecr describe-repositories --repository-names "$PROJECT_NAME-$ENVIRONMENT-agent" --region $AWS_REGION --query 'repositories[0].repositoryUri' --output text 2>/dev/null || echo "")

if [ -z "$ECR_REPO" ]; then
    echo "Creating ECR repository..."
    ECR_REPO=$(aws ecr create-repository --repository-name "$PROJECT_NAME-$ENVIRONMENT-agent" --region $AWS_REGION --query 'repository.repositoryUri' --output text)
fi

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO

cd agents
docker build -t $ECR_REPO:latest .
docker push $ECR_REPO:latest
cd ..

echo "✅ Docker image pushed to ECR: $ECR_REPO:latest"

# Step 3: Deploy Lambda functions
echo "🔧 Deploying Lambda functions..."
cd lambda

# Install dependencies
pip3 install -r api/requirements.txt -t api/

# Package and deploy with SAM
sam build
sam deploy \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset \
    --stack-name "$PROJECT_NAME-$ENVIRONMENT-api" \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --resolve-s3 \
    --parameter-overrides \
        Environment=$ENVIRONMENT \
        ProjectName=$PROJECT_NAME \
        SubnetIds="$SUBNET_IDS" \
        SecurityGroupId="$SECURITY_GROUP_ID"

cd ..

# Step 4: Update GitHub OAuth parameters
echo "🔑 Setting up GitHub OAuth..."

if [ -z "$GITHUB_CLIENT_ID" ] || [ -z "$GITHUB_CLIENT_SECRET" ]; then
    echo "⚠️  GitHub OAuth credentials not found in env"
    exit 1
fi

aws ssm put-parameter --name "/$PROJECT_NAME/$ENVIRONMENT/github/client_id" --value "$GITHUB_CLIENT_ID" --type "String" --overwrite --region $AWS_REGION
aws ssm put-parameter --name "/$PROJECT_NAME/$ENVIRONMENT/github/client_secret" --value "$GITHUB_CLIENT_SECRET" --type "SecureString" --overwrite --region $AWS_REGION

echo "✅ GitHub OAuth parameters updated in SSM"

echo "🎉 Deployment completed successfully!"