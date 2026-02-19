#!/bin/bash

echo "🔍 VajraOpz Backend Setup Verification"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        return 1
    fi
}

check_env_var() {
    if [ -n "${!1}" ]; then
        echo -e "${GREEN}✓${NC} $1 is set"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $1 is not set"
        return 1
    fi
}

# Check required commands
echo -e "\n📦 Checking required tools..."
check_command "aws"
check_command "terraform"
check_command "sam"
check_command "docker"
check_command "python3"
check_command "pip"

# Check AWS CLI configuration
echo -e "\n🔑 Checking AWS configuration..."
if aws sts get-caller-identity &> /dev/null; then
    echo -e "${GREEN}✓${NC} AWS CLI is configured"
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo "   Account ID: $ACCOUNT_ID"
else
    echo -e "${RED}✗${NC} AWS CLI is not configured or lacks permissions"
fi

# Check Docker daemon
echo -e "\n🐳 Checking Docker..."
if docker info &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker daemon is running"
else
    echo -e "${RED}✗${NC} Docker daemon is not running"
fi

# Check environment variables
echo -e "\n🔐 Checking environment variables..."
check_env_var "GITHUB_CLIENT_ID"
check_env_var "GITHUB_CLIENT_SECRET"

echo -e "\n🤖 Checking AI API keys (optional)..."
check_env_var "OPENROUTER_API_KEY"
check_env_var "ANTHROPIC_API_KEY"
check_env_var "GOOGLE_API_KEY"
check_env_var "SARVAM_API_KEY"
check_env_var "CODEIUM_API_KEY"

# Check Python dependencies
echo -e "\n🐍 Checking Python environment..."
if python3 -c "import boto3, requests" &> /dev/null; then
    echo -e "${GREEN}✓${NC} Required Python packages are available"
else
    echo -e "${YELLOW}⚠${NC} Some Python packages may be missing"
    echo "   Run: pip install boto3 requests"
fi

# Summary
echo -e "\n📋 Setup Summary"
echo "=================="

if [ -z "$GITHUB_CLIENT_ID" ] || [ -z "$GITHUB_CLIENT_SECRET" ]; then
    echo -e "${YELLOW}⚠${NC} GitHub OAuth not configured"
    echo "   1. Create GitHub OAuth App: https://github.com/settings/developers"
    echo "   2. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables"
    echo ""
fi

if ! command -v terraform &> /dev/null; then
    echo -e "${RED}✗${NC} Install Terraform: https://terraform.io/downloads"
fi

if ! command -v sam &> /dev/null; then
    echo -e "${RED}✗${NC} Install SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}✗${NC} Start Docker daemon"
fi

echo -e "\n🚀 Ready to deploy? Run: ${GREEN}./deploy.sh${NC}"