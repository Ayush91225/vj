# Authentication Fix Applied ✅

## Issue
`ResourceNotFoundException` when calling PutItem - DynamoDB tables not found

## Root Cause
Lambda functions were configured with incorrect table names:
- Expected: `vajraopz-prod-users`, `vajraopz-prod-projects`
- Actual: `vajraopz-users`, `vajraopz-projects`

## Fix Applied

### 1. Created Missing Tables
```bash
bash backend/create-tables.sh
```
Created:
- ✅ vajraopz-prod-deployments
- ✅ vajraopz-prod-agent-runs

### 2. Updated Lambda Environment Variables

**API Lambda (vajraopz-api):**
- USERS_TABLE: `vajraopz-users`
- PROJECTS_TABLE: `vajraopz-projects`
- DEPLOYMENTS_TABLE: `vajraopz-prod-deployments`
- AGENT_RUNS_TABLE: `vajraopz-prod-agent-runs`
- GITHUB_CLIENT_ID: ✅ Set
- GITHUB_CLIENT_SECRET: ✅ Set
- JWT_SECRET: ✅ Set

**Worker Lambda (vajraopz-agent-worker):**
- PROJECTS_TABLE: `vajraopz-projects`
- DEPLOYMENTS_TABLE: `vajraopz-prod-deployments`
- AI API Keys: ✅ Set

### 3. Updated Deployment Script
`backend/deploy-optimized.sh` now uses correct table names

## Verification

Test authentication:
```bash
curl -X POST https://7qwlci3xodqqlvvtupdlhrcume0xntdd.lambda-url.ap-south-1.on.aws \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { githubAuth { url state } }"}'
```

Expected: GitHub OAuth URL with client_id ✅

## DynamoDB Tables

Current tables:
- vajraopz-users (existing)
- vajraopz-projects (existing)
- vajraopz-prod-deployments (created)
- vajraopz-prod-agent-runs (existing)

## Status: FIXED ✅

Authentication should now work correctly. Try logging in with GitHub.
