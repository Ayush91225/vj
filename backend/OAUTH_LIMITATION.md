# GitHub OAuth App Limitation

## The Real Problem

GitHub **OAuth Apps** have limited API access. The 403 "Resource not accessible by integration" error means OAuth apps **cannot create branches** via the API, even with `repo` scope.

## Solutions

### Option 1: Use GitHub App (Recommended for Production)
Convert to a GitHub App which has full API access.

### Option 2: Use Personal Access Token
Users generate their own PAT with `repo` scope.

### Option 3: Create Branch in Worker Lambda (CURRENT FIX)
Don't create the branch immediately - create it when the user triggers the fix workflow, which uses git commands directly.

## Current Implementation

The branch will be created when you click "Fix" or "Fix All", not when creating the project. This is actually better because:
- ✅ Branch only created when needed
- ✅ Uses git commands (not API)
- ✅ Works with OAuth tokens

## What This Means

When you create a project, the branch name is saved but not created yet. When you trigger a fix:
1. Worker Lambda clones the repo
2. Creates the branch locally
3. Pushes fixes to the new branch
4. Branch appears on GitHub ✅
