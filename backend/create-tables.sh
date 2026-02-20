#!/bin/bash

set -e

AWS_REGION="ap-south-1"

echo "🗄️  Creating DynamoDB Tables"
echo "============================"
echo ""

# Create users table
echo "Creating vajraopz-prod-users..."
aws dynamodb create-table \
  --table-name vajraopz-prod-users \
  --attribute-definitions \
    AttributeName=user_id,AttributeType=S \
    AttributeName=github_id,AttributeType=S \
  --key-schema \
    AttributeName=user_id,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=github-id-index,KeySchema=[{AttributeName=github_id,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION 2>/dev/null || echo "Table already exists"

# Create projects table
echo "Creating vajraopz-prod-projects..."
aws dynamodb create-table \
  --table-name vajraopz-prod-projects \
  --attribute-definitions \
    AttributeName=project_id,AttributeType=S \
    AttributeName=user_id,AttributeType=S \
  --key-schema \
    AttributeName=project_id,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=user-id-index,KeySchema=[{AttributeName=user_id,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION 2>/dev/null || echo "Table already exists"

# Create deployments table
echo "Creating vajraopz-prod-deployments..."
aws dynamodb create-table \
  --table-name vajraopz-prod-deployments \
  --attribute-definitions \
    AttributeName=deployment_id,AttributeType=S \
  --key-schema \
    AttributeName=deployment_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION 2>/dev/null || echo "Table already exists"

# Create agent-runs table
echo "Creating vajraopz-prod-agent-runs..."
aws dynamodb create-table \
  --table-name vajraopz-prod-agent-runs \
  --attribute-definitions \
    AttributeName=run_id,AttributeType=S \
    AttributeName=deployment_id,AttributeType=S \
  --key-schema \
    AttributeName=run_id,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=deployment-id-index,KeySchema=[{AttributeName=deployment_id,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION 2>/dev/null || echo "Table already exists"

echo ""
echo "✅ DynamoDB tables created!"
echo ""
echo "Tables:"
aws dynamodb list-tables --region $AWS_REGION --query 'TableNames[?starts_with(@, `vajraopz-prod`)]' --output table
