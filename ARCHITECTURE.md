# VajraOpz - Complete Architecture Analysis

## 🏗️ System Overview

VajraOpz is an AI-powered deployment platform that automatically detects and fixes code issues using multi-agent analysis.

### Tech Stack

**Frontend:**
- React 18 + Vite
- Zustand (State Management)
- React Router v7
- Phosphor Icons
- Recharts

**Backend:**
- Python 3.8+ (Flask for dev, AWS Lambda for prod)
- GraphQL API
- AWS DynamoDB (prod) / In-memory (dev)
- AWS ECS Fargate (agent execution)
- AWS S3 (code storage)

**Authentication:**
- GitHub OAuth 2.0
- JWT-like tokens (HMAC-signed)

**AI Agents:**
- OpenRouter
- Claude (Anthropic)
- Gemini (Google)
- Sarvam
- Codeium

---

## 📁 Project Structure

```
VajraOpz/
├── src/                          # Frontend React app
│   ├── components/
│   │   ├── layout/              # Sidebar, Header, NavItem
│   │   ├── pages/               # Page components
│   │   │   ├── AuthPage.jsx    # GitHub OAuth login
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── NewProjectPage.jsx
│   │   │   ├── DeploymentsPage.jsx
│   │   │   └── ProductionDeployment.jsx
│   │   ├── ui/                  # Reusable UI components
│   │   └── common/              # ErrorBoundary
│   ├── store/                   # Zustand stores
│   │   ├── useAuthStore.js     # Authentication state
│   │   ├── useProjectStore.js  # Project data
│   │   ├── useDeploymentStore.js
│   │   └── useUIStore.js       # UI preferences
│   ├── services/
│   │   ├── api.js              # Mock API (legacy)
│   │   └── backendApi.js       # Real GraphQL API
│   ├── config/
│   │   ├── backend.js          # Backend URLs & GraphQL queries
│   │   └── env.js              # Environment config
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Helper functions
│   └── constants/               # App constants
│
├── backend/
│   ├── lambda/
│   │   └── api/
│   │       ├── handler.py      # Main Lambda handler
│   │       ├── dev_server.py   # Local Flask dev server
│   │       └── requirements.txt
│   ├── agents/
│   │   ├── orchestrator.py     # Multi-agent orchestration
│   │   ├── Dockerfile          # Agent container
│   │   └── requirements.txt
│   └── infrastructure/
│       └── main.tf             # Terraform IaC
│
└── docs/                        # Documentation
```

---

## 🔐 Authentication Flow

### 1. Initial Load
```
User visits app
  ↓
App.jsx checks token
  ↓
No token? → Redirect to /auth
Has token? → Validate expiry
  ↓
Valid? → Show app
Expired? → Redirect to /auth
```

### 2. GitHub OAuth Flow
```
User clicks "Continue with GitHub"
  ↓
Frontend: backendApi.initiateGitHubAuth()
  ↓
Backend: Generate state token, return GitHub URL
  ↓
Frontend: Redirect to GitHub
  ↓
User authorizes on GitHub
  ↓
GitHub redirects to: /auth/callback?code=xxx&state=yyy
  ↓
Frontend: backendApi.handleGitHubCallback(code, state)
  ↓
Backend: Exchange code for GitHub access token
  ↓
Backend: Fetch user profile from GitHub API
  ↓
Backend: Create/update user in database
  ↓
Backend: Generate app token (JWT-like)
  ↓
Frontend: Store token in localStorage
  ↓
Frontend: Update Zustand auth store
  ↓
Frontend: Redirect to /project
```

### 3. Token Format
```
base64_payload.hmac_signature

Payload:
{
  "user_id": "uuid",
  "iat": 1700000000,  // Issued at (Unix timestamp)
  "exp": 1700086400   // Expires at (24h later)
}
```

### 4. Token Validation
```javascript
// Frontend: backendApi.js
_parseToken(token) {
  const [payload, signature] = token.split('.');
  const decoded = JSON.parse(atob(payload));
  
  if (decoded.exp < Date.now() / 1000) {
    return null; // Expired
  }
  
  return decoded;
}
```

---

## 🔄 State Management (Zustand)

### Auth Store (`useAuthStore.js`)
```javascript
{
  user: { id, username, email, avatar_url },
  isAuthenticated: boolean,
  token: string,
  
  login(userData, token),
  logout(),
  updateUser(userData),
  validateAuth() // NEW: Syncs with localStorage
}
```

### Project Store (`useProjectStore.js`)
```javascript
{
  projects: [],
  selectedProject: null,
  loading: boolean,
  
  fetchProjects(),
  createProject(data),
  setSelectedProject(id)
}
```

### Deployment Store (`useDeploymentStore.js`)
```javascript
{
  deployments: [],
  currentDeployment: null,
  agentRuns: [],
  
  fetchDeployments(),
  triggerAgent(projectId),
  getDeploymentDetails(id)
}
```

### UI Store (`useUIStore.js`)
```javascript
{
  sidebarCollapsed: boolean,
  sidebarMobileOpen: boolean,
  searchQuery: string,
  
  toggleSidebar(),
  setSearchQuery(query)
}
```

---

## 🌐 API Architecture

### GraphQL Endpoint
```
Development: http://localhost:3001/graphql
Production:  https://api.vajraopz.com/graphql
```

### Queries & Mutations

**Authentication:**
```graphql
# Initiate GitHub OAuth
query githubAuth {
  githubAuth {
    url
    state
  }
}

# Handle OAuth callback
mutation githubCallback($code: String!, $state: String!) {
  githubCallback(code: $code, state: $state) {
    user { id username email avatar_url }
    token
  }
}
```

**Projects:**
```graphql
# Create project
mutation createProject(
  $token: String!
  $githubRepo: String!
  $teamName: String!
  $teamLeader: String!
) {
  createProject(...) {
    id
    status
    branch_name
  }
}

# Get all projects
query getProjects($token: String!) {
  getProjects(token: $token) {
    project_id
    github_repo
    team_name
    status
    created_at
  }
}
```

**Deployments:**
```graphql
# Trigger AI agent analysis
mutation triggerAgent($token: String!, $projectId: String!) {
  triggerAgent(token: $token, projectId: $projectId) {
    deploymentId
    runId
    status
  }
}

# Get deployment details
query getDeployment($token: String!, $deploymentId: String!) {
  getDeployment(token: $token, deploymentId: $deploymentId) {
    deployment_id
    status
    agent_runs {
      run_id
      status
      agents
      results
    }
  }
}
```

---

## 🤖 Multi-Agent System

### Agent Orchestration Flow
```
User triggers deployment
  ↓
Backend creates deployment record
  ↓
Backend launches ECS Fargate task
  ↓
orchestrator.py starts
  ↓
Clone GitHub repo
  ↓
Run agents in parallel:
  - OpenRouter (code quality)
  - Claude (security analysis)
  - Gemini (performance optimization)
  - Sarvam (best practices)
  - Codeium (code completion)
  ↓
Aggregate results
  ↓
Calculate quality score
  ↓
Generate fixes
  ↓
Create PR with fixes
  ↓
Update deployment status
```

### Agent Results Format
```json
{
  "deployment_id": "uuid",
  "quality_score": 85,
  "issues": [
    {
      "agent": "claude",
      "severity": "high",
      "type": "security",
      "file": "src/auth.js",
      "line": 42,
      "message": "SQL injection vulnerability",
      "fix": "Use parameterized queries"
    }
  ],
  "fixes_applied": 12,
  "pr_url": "https://github.com/user/repo/pull/123"
}
```

---

## 🗄️ Database Schema

### Users Table
```python
{
  "user_id": "uuid",           # Primary key
  "github_id": "12345",        # GitHub user ID
  "username": "johndoe",
  "email": "john@example.com",
  "avatar_url": "https://...",
  "access_token": "gho_...",   # GitHub access token
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Projects Table
```python
{
  "project_id": "uuid",        # Primary key
  "user_id": "uuid",           # Foreign key
  "github_repo": "user/repo",
  "team_name": "Team Alpha",
  "team_leader": "John Doe",
  "branch_name": "TEAM_ALPHA_JOHN_DOE_AI_Fix",
  "status": "created|running|completed|failed",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Deployments Table
```python
{
  "deployment_id": "uuid",     # Primary key
  "project_id": "uuid",        # Foreign key
  "status": "running|completed|failed",
  "quality_score": 85,
  "issues_found": 12,
  "fixes_applied": 10,
  "pr_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Agent Runs Table
```python
{
  "run_id": "uuid",            # Primary key
  "deployment_id": "uuid",     # Foreign key
  "status": "initializing|running|completed|failed",
  "agents": ["openrouter", "claude", "gemini"],
  "retry_count": 0,
  "max_retries": 5,
  "results": { ... },          # JSON blob
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## 🚀 Deployment Architecture

### Development
```
Frontend: Vite dev server (localhost:3000)
Backend:  Flask dev server (localhost:3001)
Database: In-memory Python dictionaries
Agents:   Local Python execution
```

### Production
```
Frontend: Vercel (vajraopz.vercel.app)
Backend:  AWS Lambda + API Gateway
Database: AWS DynamoDB
Storage:  AWS S3
Agents:   AWS ECS Fargate
IaC:      Terraform
```

### AWS Resources
```
- Lambda Function: vajraopz-prod-api
- DynamoDB Tables:
  - vajraopz-prod-users
  - vajraopz-prod-projects
  - vajraopz-prod-deployments
  - vajraopz-prod-agent-runs
- S3 Bucket: vajraopz-prod-code-storage
- ECS Cluster: vajraopz-prod-agents
- API Gateway: vajraopz-prod-api
- SSM Parameters:
  - /vajraopz/prod/github/client_id
  - /vajraopz/prod/github/client_secret
```

---

## 🔒 Security Features

1. **Authentication**
   - GitHub OAuth 2.0
   - HMAC-signed tokens
   - 24-hour token expiry
   - CSRF protection with state parameter

2. **Authorization**
   - Token validation on every request
   - User-scoped data access
   - No shared resources between users

3. **Data Protection**
   - Secrets in AWS SSM Parameter Store
   - Environment variables for sensitive data
   - No credentials in code or logs

4. **Network Security**
   - CORS configured for specific origins
   - HTTPS in production
   - API rate limiting (TODO)

---

## 📊 Performance Optimizations

1. **Frontend**
   - Code splitting with React.lazy()
   - Zustand for efficient state updates
   - localStorage persistence
   - Responsive design with CSS

2. **Backend**
   - GraphQL for efficient data fetching
   - DynamoDB single-table design
   - Lambda cold start optimization
   - ECS task auto-scaling

3. **Agents**
   - Parallel agent execution
   - Result caching
   - Incremental analysis
   - Retry logic with exponential backoff

---

## 🐛 Error Handling

### Frontend
```javascript
// ErrorBoundary catches React errors
<ErrorBoundary>
  <App />
</ErrorBoundary>

// API errors shown to user
try {
  await backendApi.createProject(...)
} catch (error) {
  setError(error.message)
}
```

### Backend
```python
# All endpoints wrapped in try-except
try:
    result = handle_create_project(variables)
    return create_response(200, result)
except Exception as e:
    print(f"Error: {e}")
    return create_response(500, {
        'errors': [{'message': str(e)}]
    })
```

---

## 🧪 Testing Strategy

1. **Unit Tests** (TODO)
   - Component tests with React Testing Library
   - Store tests with Zustand
   - API tests with pytest

2. **Integration Tests** (TODO)
   - End-to-end auth flow
   - Project creation flow
   - Agent execution flow

3. **Manual Testing**
   - See TESTING_GUIDE.md

---

## 📈 Monitoring & Logging

### Development
- Console logs in browser
- Python print statements
- Flask debug mode

### Production (TODO)
- AWS CloudWatch Logs
- AWS X-Ray tracing
- Error tracking (Sentry)
- Analytics (Mixpanel)

---

## 🔮 Future Enhancements

1. **Authentication**
   - [ ] Token refresh mechanism
   - [ ] Remember me functionality
   - [ ] Multi-factor authentication
   - [ ] Social login (Google, GitLab)

2. **Features**
   - [ ] Real-time deployment status
   - [ ] Webhook notifications
   - [ ] Team collaboration
   - [ ] Custom agent configuration
   - [ ] Deployment history
   - [ ] Cost tracking

3. **Performance**
   - [ ] Redis caching
   - [ ] CDN for static assets
   - [ ] Database query optimization
   - [ ] Agent result streaming

4. **DevOps**
   - [ ] CI/CD pipeline
   - [ ] Automated testing
   - [ ] Blue-green deployments
   - [ ] Disaster recovery

---

## 📚 Documentation

- `README.md` - Project overview
- `AUTH_FIX_SUMMARY.md` - Authentication fixes
- `TESTING_GUIDE.md` - Testing instructions
- `ARCHITECTURE.md` - This file
- `PRODUCTION.md` - Production deployment guide
- `backend/GITHUB_OAUTH_SETUP.md` - OAuth setup guide
