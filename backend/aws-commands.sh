#!/bin/bash

# VajraOpz AWS Quick Commands
# Usage: bash aws-commands.sh [command]

AWS_REGION="ap-south-1"
API_FUNCTION="vajraopz-api"
WORKER_FUNCTION="vajraopz-agent-worker"

case "$1" in
  logs-api)
    echo "📋 Tailing API logs..."
    aws logs tail /aws/lambda/$API_FUNCTION --follow --region $AWS_REGION
    ;;
  
  logs-worker)
    echo "📋 Tailing Worker logs..."
    aws logs tail /aws/lambda/$WORKER_FUNCTION --follow --region $AWS_REGION
    ;;
  
  status)
    echo "📊 Lambda Functions Status:"
    echo ""
    echo "API Function:"
    aws lambda get-function --function-name $API_FUNCTION --region $AWS_REGION --query 'Configuration.[FunctionName,Runtime,MemorySize,Timeout,LastModified]' --output table
    echo ""
    echo "Worker Function:"
    aws lambda get-function --function-name $WORKER_FUNCTION --region $AWS_REGION --query 'Configuration.[FunctionName,Runtime,MemorySize,Timeout,LastModified]' --output table
    ;;
  
  url)
    echo "🔗 API Function URL:"
    aws lambda get-function-url-config --function-name $API_FUNCTION --region $AWS_REGION --query 'FunctionUrl' --output text
    ;;
  
  test)
    echo "🧪 Testing API..."
    API_URL=$(aws lambda get-function-url-config --function-name $API_FUNCTION --region $AWS_REGION --query 'FunctionUrl' --output text)
    curl -X POST $API_URL \
      -H "Content-Type: application/json" \
      -d '{"query":"mutation { githubAuth { url state } }"}' \
      -s | python3 -m json.tool
    ;;
  
  invoke-worker)
    echo "🤖 Invoking worker (test)..."
    aws lambda invoke \
      --function-name $WORKER_FUNCTION \
      --payload '{"project_id":"test","deployment_id":"test"}' \
      --region $AWS_REGION \
      response.json
    cat response.json | python3 -m json.tool
    rm response.json
    ;;
  
  tables)
    echo "📊 DynamoDB Tables:"
    aws dynamodb list-tables --region $AWS_REGION --query 'TableNames[?starts_with(@, `vajraopz`)]' --output table
    ;;
  
  bucket)
    echo "🪣 S3 Bucket Contents:"
    aws s3 ls s3://vajraopz-prod-code-storage-95e7da262c609cef/ --recursive --human-readable --summarize
    ;;
  
  deploy)
    echo "🚀 Redeploying..."
    bash deploy-optimized.sh
    ;;
  
  *)
    echo "VajraOpz AWS Quick Commands"
    echo ""
    echo "Usage: bash aws-commands.sh [command]"
    echo ""
    echo "Commands:"
    echo "  logs-api      - Tail API Lambda logs"
    echo "  logs-worker   - Tail Worker Lambda logs"
    echo "  status        - Show Lambda functions status"
    echo "  url           - Show API Function URL"
    echo "  test          - Test API endpoint"
    echo "  invoke-worker - Test worker Lambda"
    echo "  tables        - List DynamoDB tables"
    echo "  bucket        - Show S3 bucket contents"
    echo "  deploy        - Redeploy all functions"
    echo ""
    ;;
esac
