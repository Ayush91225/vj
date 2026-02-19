# VajraOpz Backend

Enterprise-grade backend infrastructure for VajraOpz AI-powered DevOps platform with multi-agent code analysis and automated fixing capabilities.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │   Lambda        │
│   (React)       │───▶│   (GraphQL)      │───▶│   (Python)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                       ┌─────────────────┐              │
                       │   DynamoDB      │◀─────────────┘
                       │   (Database)    │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   ECS Fargate   │
                       │   (Agents)      │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   S3 Bucket     │
                       │   (Code/Results)│
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- AWS CLI configured with appropriate permissions
- Docker installed and running
- Terraform >= 1.0
- SAM CLI installed
- Python 3.11+
- Node.js 18+ (for frontend)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd VajraOpz/backend
```

### 2. Configure GitHub OAuth

Create a GitHub OAuth App:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Configure:
   - **Application name**: VajraOpz
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`

Set environment variables:
```bash
export GITHUB_CLIENT_ID=your_client_id
export GITHUB_CLIENT_SECRET=your_client_secret
```

### 3. Configure AI Agent API Keys

```bash
export OPENROUTER_API_KEY=your_openrouter_key
export ANTHROPIC_API_KEY=your_claude_key
export GOOGLE_API_KEY=your_gemini_key
export SARVAM_API_KEY=your_sarvam_key
export CODEIUM_API_KEY=your_codeium_key
```

### 4. Deploy Infrastructure

```bash
chmod +x deploy.sh
./deploy.sh
```

This will:
- Deploy AWS infrastructure (DynamoDB, S3, ECS, VPC)
- Build and push Docker images to ECR
- Deploy Lambda functions with API Gateway
- Configure GitHub OAuth parameters
- Generate frontend configuration

## 📦 Components

### Infrastructure (Terraform)

**Resources Created:**
- **DynamoDB Tables**: Users, Projects, Deployments, Agent Runs
- **S3 Bucket**: Code storage and results with versioning
- **ECS Cluster**: Fargate cluster for agent execution
- **VPC**: Isolated network with public subnets
- **IAM Roles**: Least-privilege access for services
- **SSM Parameters**: Secure storage for secrets

### API Layer (Lambda + API Gateway)

**GraphQL Endpoints:**
- `githubAuth`: Initiate GitHub OAuth flow
- `githubCallback`: Handle OAuth callback and create user
- `createProject`: Create new project with team info
- `triggerAgent`: Start multi-agent code analysis
- `getProjects`: Retrieve user projects
- `getDeployment`: Get deployment status and results

### Multi-Agent System (ECS + Docker)

**5 AI Agents:**
1. **OpenRouter Agent**: Claude 3.5 Sonnet via OpenRouter
2. **Claude Agent**: Direct Anthropic API integration
3. **Gemini Agent**: Google's Gemini 1.5 Pro
4. **Sarvam Agent**: Sarvam AI for specialized analysis
5. **Codeium Agent**: Code-specific AI assistance

**CTO Agent**: Evaluates and selects best fixes from all agents

### Branch Naming Compliance

Automatically generates branches in required format:
```
TEAM_NAME_LEADER_NAME_AI_Fix
```

Examples:
- `RIFT_ORGANISERS_SAIYAM_KUMAR_AI_Fix`
- `CODE_WARRIORS_JOHN_DOE_AI_Fix`

### Issue Detection & Formatting

Generates output matching exact test case requirements:
```
LINTING error in src/utils.py line 15 → Fix: remove the import statement
SYNTAX error in src/validator.py line 8 → Fix: add the colon at the correct position
```

## 🔧 Configuration

### Environment Variables

**Required for Deployment:**
```bash
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

**Required for Agent Execution:**
```bash
OPENROUTER_API_KEY=your_openrouter_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
SARVAM_API_KEY=your_sarvam_api_key
CODEIUM_API_KEY=your_codeium_api_key
```

### Terraform Variables

```hcl
variable \"aws_region\" {
  default = \"us-east-1\"
}

variable \"environment\" {
  default = \"prod\"
}

variable \"project_name\" {
  default = \"vajraopz\"
}
```

## 🔒 Security Features

### Authentication & Authorization
- GitHub OAuth 2.0 integration
- JWT token-based authentication
- CSRF protection with state parameter
- Secure token storage in localStorage

### Infrastructure Security
- VPC isolation with private subnets
- Security groups with minimal required access
- IAM roles with least-privilege principles
- Encrypted S3 storage
- SSM Parameter Store for secrets

### Code Execution Security
- Docker containerization for agent isolation
- ECS Fargate for serverless container execution
- Resource limits and timeouts
- Sandboxed code analysis environment

## 📊 Monitoring & Logging

### CloudWatch Integration
- Lambda function logs and metrics
- ECS task execution logs
- API Gateway access logs
- Custom metrics for agent performance

### Error Handling
- Comprehensive error boundaries
- Retry mechanisms with exponential backoff
- Dead letter queues for failed executions
- Detailed error logging and alerting

## 🧪 Testing

### Local Development

1. **Start Local API Server:**
```bash
cd lambda/api
python -m pip install -r requirements.txt
python handler.py
```

2. **Test GraphQL Endpoints:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { githubAuth { url state } }"}'
```

### Integration Testing

```bash
# Test agent execution locally
cd agents
python orchestrator.py '{"repo_url": "https://github.com/test/repo", "team_name": "Test Team", "team_leader": "Test Leader"}'
```

## 📈 Scaling Considerations

### Performance Optimization
- DynamoDB on-demand billing for cost efficiency
- ECS auto-scaling based on CPU/memory usage
- Lambda concurrent execution limits
- S3 transfer acceleration for large repositories

### Cost Management
- Pay-per-request DynamoDB pricing
- Fargate spot instances for non-critical workloads
- S3 lifecycle policies for old results
- Lambda provisioned concurrency for consistent performance

## 🚨 Troubleshooting

### Common Issues

**1. GitHub OAuth Fails**
```bash
# Check SSM parameters
aws ssm get-parameter --name "/vajraopz/prod/github/client_id"
```

**2. Agent Execution Timeout**
```bash
# Check ECS task logs
aws logs get-log-events --log-group-name "/ecs/vajraopz-prod-agent"
```

**3. Lambda Cold Starts**
```bash
# Enable provisioned concurrency
aws lambda put-provisioned-concurrency-config \
  --function-name vajraopz-prod-graphql \
  --provisioned-concurrency-config ProvisionedConcurrencyConfig=5
```

### Debug Commands

```bash
# Check infrastructure status
terraform show

# View API Gateway logs
aws logs describe-log-groups --log-group-name-prefix "/aws/apigateway"

# Monitor ECS tasks
aws ecs list-tasks --cluster vajraopz-prod-agents
```

## 🔄 CI/CD Pipeline

### Automated Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Infrastructure
        run: |
          cd backend
          ./deploy.sh
        env:
          GITHUB_CLIENT_ID: ${{ secrets.GITHUB_CLIENT_ID }}
          GITHUB_CLIENT_SECRET: ${{ secrets.GITHUB_CLIENT_SECRET }}
```

## 📚 API Documentation

### GraphQL Schema

```graphql
type Query {
  githubAuth: GitHubAuthResponse
  getProjects(token: String!): [Project]
  getDeployment(token: String!, deploymentId: String!): Deployment
}

type Mutation {
  githubCallback(code: String!, state: String!): AuthResponse
  createProject(token: String!, githubRepo: String!, teamName: String!, teamLeader: String!): Project
  triggerAgent(token: String!, projectId: String!): AgentExecution
}
```

### Response Examples

**GitHub Auth:**
```json
{
  "data": {
    "githubAuth": {
      "url": "https://github.com/login/oauth/authorize?client_id=...",
      "state": "csrf-protection-token"
    }
  }
}
```

**Agent Execution:**
```json
{
  "data": {
    "triggerAgent": {
      "deploymentId": "uuid-deployment-id",
      "runId": "uuid-run-id",
      "status": "running"
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

**Built with ❤️ for the future of AI-powered DevOps**