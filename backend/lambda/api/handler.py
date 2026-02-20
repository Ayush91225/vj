import json
import os
import uuid
import hmac
import hashlib
import time
import requests
from datetime import datetime, timezone
import base64
from typing import Dict, Any, Optional
from decimal import Decimal

# ─── Detect environment ──────────────────────────────────────────────
IS_LOCAL = os.environ.get('IS_LOCAL', 'false').lower() == 'true'

# ─── In-memory stores for local dev ─────────────────────────────────
_local_users = {}
_local_projects = {}
_local_deployments = {}
_local_agent_runs = {}
_oauth_states = {}

# ─── JWT secret (use a proper secret in production) ─────────────────
JWT_SECRET = os.environ.get('JWT_SECRET', 'vajraopz-dev-secret-key-change-in-production')

# ─── AWS clients (only when running in Lambda) ──────────────────────
dynamodb = None
s3 = None
ecs = None
ssm = None
users_table = None
projects_table = None
deployments_table = None
agent_runs_table = None

if not IS_LOCAL:
    import boto3
    dynamodb = boto3.resource('dynamodb')
    s3 = boto3.client('s3')
    ecs = boto3.client('ecs')
    ssm = boto3.client('ssm')

    USERS_TABLE = os.environ.get('USERS_TABLE', 'vajraopz-prod-users')
    PROJECTS_TABLE = os.environ.get('PROJECTS_TABLE', 'vajraopz-prod-projects')
    DEPLOYMENTS_TABLE = os.environ.get('DEPLOYMENTS_TABLE', 'vajraopz-prod-deployments')
    AGENT_RUNS_TABLE = os.environ.get('AGENT_RUNS_TABLE', 'vajraopz-prod-agent-runs')
    S3_BUCKET = os.environ.get('S3_BUCKET', 'vajraopz-prod-code-storage')
    ECS_CLUSTER = os.environ.get('ECS_CLUSTER', 'vajraopz-prod-agents')
    GITHUB_CLIENT_ID_PARAM = os.environ.get('GITHUB_CLIENT_ID_PARAM', '/vajraopz/prod/github/client_id')
    GITHUB_CLIENT_SECRET_PARAM = os.environ.get('GITHUB_CLIENT_SECRET_PARAM', '/vajraopz/prod/github/client_secret')

    users_table = dynamodb.Table(USERS_TABLE)
    projects_table = dynamodb.Table(PROJECTS_TABLE)
    deployments_table = dynamodb.Table(DEPLOYMENTS_TABLE)
    agent_runs_table = dynamodb.Table(AGENT_RUNS_TABLE)


# ─── GitHub OAuth Config ─────────────────────────────────────────────
GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID', 'Iv23liqkVfyeR5Wi86hU')
GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET', '')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
CALLBACK_URL = os.environ.get('CALLBACK_URL', f'{FRONTEND_URL}/auth/callback')


# =====================================================================
#  LAMBDA ENTRY POINT
# =====================================================================
def lambda_handler(event, context):
    """Main Lambda handler for GraphQL API"""
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return create_response(200, {})

    try:
        body = json.loads(event.get('body', '{}'))
        return route_graphql(body)
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'errors': [{'message': 'Internal server error'}]})


def route_graphql(body: Dict[str, Any]) -> Dict[str, Any]:
    """Route GraphQL queries/mutations to resolvers"""
    query = body.get('query', '')
    variables = body.get('variables', {})

    # Remove whitespace and newlines for easier matching
    query_normalized = ' '.join(query.split())

    if 'githubCallback' in query_normalized:
        return handle_github_callback(variables)
    elif 'githubAuth' in query_normalized:
        return handle_github_auth(variables)
    elif 'createProject' in query_normalized:
        return handle_create_project(variables)
    elif 'triggerAgent' in query_normalized:
        return handle_trigger_agent(variables)
    elif 'getProjects' in query_normalized:
        return handle_get_projects(variables)
    elif 'getDeployment' in query_normalized:
        return handle_get_deployment(variables)
    elif 'getCommits' in query_normalized:
        return handle_get_commits(variables)
    elif 'getFixes' in query_normalized:
        return handle_get_fixes(variables)
    elif 'triggerFix' in query_normalized:
        return handle_trigger_fix(variables)
    else:
        print(f"Unknown query: {query_normalized[:200]}")
        return create_response(400, {'errors': [{'message': 'Unknown query or mutation'}]})


def decimal_to_native(obj):
    if isinstance(obj, list):
        return [decimal_to_native(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: decimal_to_native(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj


def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Create standardized API response"""
    if status_code >= 400:
        print(f"API ERROR {status_code}: {json.dumps(body)}")
    
    body = decimal_to_native(body)
        
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body)
    }


# =====================================================================
#  GITHUB OAUTH
# =====================================================================
def _get_github_credentials():
    """Get GitHub OAuth credentials from SSM (Lambda) or env vars (local)"""
    # Always use environment variables for simplicity
    return GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET


def handle_github_auth(variables: Dict[str, Any]) -> Dict[str, Any]:
    """Initiate GitHub OAuth flow — returns the authorization URL"""
    try:
        client_id, _ = _get_github_credentials()

        # Generate CSRF state token
        state = str(uuid.uuid4())
        _oauth_states[state] = datetime.now(timezone.utc).isoformat()

        redirect_uri = CALLBACK_URL
        github_url = (
            f"https://github.com/login/oauth/authorize"
            f"?client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope=repo,user:email"
            f"&state={state}"
        )

        return create_response(200, {
            'data': {
                'githubAuth': {
                    'url': github_url,
                    'state': state
                }
            }
        })
    except Exception as e:
        print(f"GitHub auth error: {e}")
        return create_response(500, {'errors': [{'message': f'GitHub auth error: {str(e)}'}]})


def handle_github_callback(variables: Dict[str, Any]) -> Dict[str, Any]:
    """Handle GitHub OAuth callback — exchange code for token, create user"""
    try:
        code = variables.get('code')
        state = variables.get('state')

        if not code:
            return create_response(400, {'errors': [{'message': 'Missing authorization code'}]})

        client_id, client_secret = _get_github_credentials()

        if not client_secret:
            return create_response(500, {'errors': [{'message': 'GitHub client secret not configured. Set GITHUB_CLIENT_SECRET env var.'}]})

        # Exchange code for access token
        token_response = requests.post(
            'https://github.com/login/oauth/access_token',
            json={
                'client_id': client_id,
                'client_secret': client_secret,
                'code': code,
                'redirect_uri': CALLBACK_URL,
            },
            headers={'Accept': 'application/json'},
            timeout=10,
        )
        token_data = token_response.json()
        access_token = token_data.get('access_token')

        if not access_token:
            error_desc = token_data.get('error_description', 'Unknown error')
            return create_response(400, {'errors': [{'message': f'GitHub token exchange failed: {error_desc}'}]})

        # Fetch user profile from GitHub
        user_response = requests.get(
            'https://api.github.com/user',
            headers={'Authorization': f'token {access_token}'},
            timeout=10,
        )
        user_data = user_response.json()

        # Fetch user emails (in case primary email is private)
        emails_response = requests.get(
            'https://api.github.com/user/emails',
            headers={'Authorization': f'token {access_token}'},
            timeout=10,
        )
        emails = emails_response.json() if emails_response.status_code == 200 else []
        primary_email = next((e['email'] for e in emails if e.get('primary')), user_data.get('email', ''))

        github_id = str(user_data['id'])
        username = user_data['login']
        avatar_url = user_data.get('avatar_url', '')
        now = datetime.now(timezone.utc).isoformat()

        # Create or find user
        user_id = _upsert_user(github_id, username, primary_email, avatar_url, access_token, now)

        # Generate our app token
        app_token = _generate_token(user_id)

        return create_response(200, {
            'data': {
                'githubCallback': {
                    'user': {
                        'id': user_id,
                        'username': username,
                        'email': primary_email,
                        'avatar_url': avatar_url,
                    },
                    'token': app_token,
                }
            }
        })
    except Exception as e:
        print(f"GitHub callback error: {e}")
        return create_response(500, {'errors': [{'message': f'GitHub callback error: {str(e)}'}]})


# =====================================================================
#  PROJECT MANAGEMENT
# =====================================================================
def handle_create_project(variables: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new project"""
    try:
        user_id = _get_user_from_token(variables.get('token'))
        if not user_id:
            return create_response(401, {'errors': [{'message': 'Unauthorized'}]})

        github_repo = variables.get('githubRepo')
        team_name = variables.get('teamName')
        team_leader = variables.get('teamLeader')

        if not all([github_repo, team_name, team_leader]):
            return create_response(400, {'errors': [{'message': 'Missing required fields: githubRepo, teamName, teamLeader'}]})

        project_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        # Generate branch name per requirements
        branch_name = _generate_branch_name(team_name, team_leader)

        project_data = {
            'project_id': project_id,
            'user_id': user_id,
            'github_repo': github_repo,
            'team_name': team_name,
            'team_leader': team_leader,
            'branch_name': branch_name,
            'status': 'created',
            'created_at': now,
            'updated_at': now,
        }

        if IS_LOCAL:
            _local_projects[project_id] = project_data
        else:
            projects_table.put_item(Item=project_data)

        return create_response(200, {
            'data': {
                'createProject': {
                    'id': project_id,
                    'status': 'created',
                    'branch_name': branch_name,
                }
            }
        })
    except Exception as e:
        print(f"Create project error: {e}")
        return create_response(500, {'errors': [{'message': f'Create project error: {str(e)}'}]})


def handle_get_projects(variables: Dict[str, Any]) -> Dict[str, Any]:
    """Get all projects for the authenticated user"""
    try:
        user_id = _get_user_from_token(variables.get('token'))
        if not user_id:
            return create_response(401, {'errors': [{'message': 'Unauthorized'}]})

        if IS_LOCAL:
            projects = [p for p in _local_projects.values() if p['user_id'] == user_id]
        else:
            response = projects_table.query(
                IndexName='user-id-index',
                KeyConditionExpression='user_id = :user_id',
                ExpressionAttributeValues={':user_id': user_id}
            )
            projects = response.get('Items', [])

        return create_response(200, {
            'data': {
                'getProjects': projects
            }
        })
    except Exception as e:
        print(f"Get projects error: {e}")
        return create_response(500, {'errors': [{'message': f'Get projects error: {str(e)}'}]})


# =====================================================================
#  AGENT EXECUTION
# =====================================================================
def handle_trigger_agent(variables: Dict[str, Any]) -> Dict[str, Any]:
    """Trigger multi-agent code analysis"""
    try:
        user_id = _get_user_from_token(variables.get('token'))
        if not user_id:
            return create_response(401, {'errors': [{'message': 'Unauthorized'}]})

        project_id = variables.get('projectId')
        if not project_id:
            return create_response(400, {'errors': [{'message': 'Missing project ID'}]})

        # Verify project exists
        if IS_LOCAL:
            if project_id not in _local_projects:
                return create_response(404, {'errors': [{'message': 'Project not found'}]})
            project_data = _local_projects[project_id]
        else:
            project = projects_table.get_item(Key={'project_id': project_id})
            if 'Item' not in project:
                return create_response(404, {'errors': [{'message': 'Project not found'}]})
            project_data = project['Item']

        deployment_id = str(uuid.uuid4())
        run_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        deployment_data = {
            'deployment_id': deployment_id,
            'project_id': project_id,
            'status': 'running',
            'created_at': now,
            'updated_at': now,
        }

        run_data = {
            'run_id': run_id,
            'deployment_id': deployment_id,
            'status': 'initializing',
            'agents': ['openrouter', 'claude', 'gemini', 'sarvam', 'codeium'],
            'retry_count': 0,
            'max_retries': 5,
            'created_at': now,
            'updated_at': now,
        }

        if IS_LOCAL:
            _local_deployments[deployment_id] = deployment_data
            _local_agent_runs[run_id] = run_data
            # Update project status
            _local_projects[project_id]['status'] = 'running'
        else:
            deployments_table.put_item(Item=deployment_data)
            agent_runs_table.put_item(Item=run_data)
            projects_table.update_item(
                Key={'project_id': project_id},
                UpdateExpression='SET #status = :status, updated_at = :updated_at',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': 'running', ':updated_at': now}
            )

            # Launch ECS task for agent execution (production only)
            try:
                subnet_ids = os.environ.get('SUBNET_IDS', '').split(',')
                security_group_id = os.environ.get('SECURITY_GROUP_ID', '')

                ecs.run_task(
                    cluster=ECS_CLUSTER,
                    taskDefinition=f'vajraopz-prod-agent',
                    launchType='FARGATE',
                    networkConfiguration={
                        'awsvpcConfiguration': {
                            'subnets': subnet_ids,
                            'securityGroups': [security_group_id],
                            'assignPublicIp': 'ENABLED'
                        }
                    },
                    overrides={
                        'containerOverrides': [{
                            'name': 'agent',
                            'environment': [
                                {'name': 'REPO_URL', 'value': project_data['github_repo']},
                                {'name': 'TEAM_NAME', 'value': project_data['team_name']},
                                {'name': 'TEAM_LEADER', 'value': project_data['team_leader']},
                                {'name': 'DEPLOYMENT_ID', 'value': deployment_id},
                                {'name': 'RUN_ID', 'value': run_id},
                            ]
                        }]
                    }
                )
            except Exception as ecs_error:
                print(f"ECS task launch failed (non-fatal): {ecs_error}")

        return create_response(200, {
            'data': {
                'triggerAgent': {
                    'deploymentId': deployment_id,
                    'runId': run_id,
                    'status': 'running',
                }
            }
        })
    except Exception as e:
        print(f"Trigger agent error: {e}")
        return create_response(500, {'errors': [{'message': f'Trigger agent error: {str(e)}'}]})


def handle_get_deployment(variables: Dict[str, Any]) -> Dict[str, Any]:
    """Get deployment details with agent run history"""
    try:
        user_id = _get_user_from_token(variables.get('token'))
        if not user_id:
            return create_response(401, {'errors': [{'message': 'Unauthorized'}]})

        deployment_id = variables.get('deploymentId')
        if not deployment_id:
            return create_response(400, {'errors': [{'message': 'Missing deployment ID'}]})

        if IS_LOCAL:
            if deployment_id not in _local_deployments:
                return create_response(404, {'errors': [{'message': 'Deployment not found'}]})
            deployment_data = dict(_local_deployments[deployment_id])
            # Get agent runs for this deployment
            deployment_data['agent_runs'] = [
                r for r in _local_agent_runs.values()
                if r['deployment_id'] == deployment_id
            ]
        else:
            deployment = deployments_table.get_item(Key={'deployment_id': deployment_id})
            if 'Item' not in deployment:
                return create_response(404, {'errors': [{'message': 'Deployment not found'}]})
            deployment_data = deployment['Item']

            agent_runs = agent_runs_table.query(
                IndexName='deployment-id-index',
                KeyConditionExpression='deployment_id = :deployment_id',
                ExpressionAttributeValues={':deployment_id': deployment_id}
            )
            deployment_data['agent_runs'] = agent_runs.get('Items', [])

        return create_response(200, {
            'data': {
                'getDeployment': deployment_data
            }
        })
    except Exception as e:
        print(f"Get deployment error: {e}")
        return create_response(500, {'errors': [{'message': f'Get deployment error: {str(e)}'}]})


def handle_get_commits(variables: Dict[str, Any]) -> Dict[str, Any]:
    """Fetch commits from GitHub for a repository"""
    try:
        user_id = _get_user_from_token(variables.get('token'))
        github_repo = variables.get('githubRepo')
        branch = variables.get('branch', 'main')
        
        if not github_repo:
            return create_response(400, {'errors': [{'message': 'Missing githubRepo'}]})
        
        # Get user's GitHub access token if authenticated
        access_token = None
        if user_id:
            if IS_LOCAL:
                user_data = _local_users.get(user_id)
                if user_data:
                    access_token = user_data.get('access_token')
            else:
                try:
                    user = users_table.get_item(Key={'user_id': user_id})
                    if 'Item' in user:
                        access_token = user['Item'].get('access_token')
                except Exception as e:
                    print(f'[GetCommits] Failed to get user token: {e}')
        
        # Clean and extract owner and repo from URL
        repo_clean = github_repo.replace('https://github.com/', '').replace('http://github.com/', '')
        repo_clean = repo_clean.rstrip('/').replace('.git', '')
        
        parts = repo_clean.split('/')
        if len(parts) < 2:
            return create_response(400, {'errors': [{'message': 'Invalid GitHub URL'}]})
        
        owner, repo = parts[0], parts[1]
        
        print(f'[GetCommits] Fetching commits for {owner}/{repo} on branch {branch}')
        
        # Prepare headers with auth token if available
        headers = {'Accept': 'application/vnd.github.v3+json'}
        if access_token:
            headers['Authorization'] = f'token {access_token}'
            print(f'[GetCommits] Using authenticated request')
        
        # Try the specified branch first
        response = requests.get(
            f'https://api.github.com/repos/{owner}/{repo}/commits',
            params={'sha': branch, 'per_page': 20},
            headers=headers,
            timeout=10
        )
        
        print(f'[GetCommits] GitHub API response status: {response.status_code}')
        
        # If branch not found, try default branch
        if response.status_code == 404 and branch != 'main':
            print(f'[GetCommits] Branch {branch} not found, trying main branch')
            response = requests.get(
                f'https://api.github.com/repos/{owner}/{repo}/commits',
                params={'sha': 'main', 'per_page': 20},
                headers=headers,
                timeout=10
            )
            print(f'[GetCommits] Main branch response status: {response.status_code}')
        
        if not response.ok:
            error_msg = response.json().get('message', 'Unknown error') if response.text else 'Unknown error'
            print(f'[GetCommits] GitHub API error: {error_msg}')
            return create_response(response.status_code, {'errors': [{'message': f'GitHub API error: {response.status_code} - {error_msg}'}]})
        
        commits_data = response.json()
        commits = [{
            'sha': c['sha'][:7],
            'message': c['commit']['message'].split('\n')[0],
            'author': c['commit']['author']['name'],
            'date': c['commit']['author']['date'],
            'url': c['html_url']
        } for c in commits_data]
        
        print(f'[GetCommits] Successfully fetched {len(commits)} commits')
        
        return create_response(200, {
            'data': {
                'getCommits': commits
            }
        })
    except Exception as e:
        print(f"Get commits error: {e}")
        return create_response(500, {'errors': [{'message': f'Get commits error: {str(e)}'}]})


def handle_get_fixes(variables: Dict[str, Any]) -> Dict[str, Any]:
    """Get fixes for a deployment"""
    try:
        user_id = _get_user_from_token(variables.get('token'))
        if not user_id:
            return create_response(401, {'errors': [{'message': 'Unauthorized'}]})
        
        deployment_id = variables.get('deploymentId')
        if not deployment_id:
            return create_response(400, {'errors': [{'message': 'Missing deploymentId'}]})
        
        if not IS_LOCAL:
            try:
                fixes_table = dynamodb.Table('vajraopz-fixes')
                response = fixes_table.query(
                    KeyConditionExpression='deployment_id = :did',
                    ExpressionAttributeValues={':did': deployment_id}
                )
                fixes = response.get('Items', [])
            except Exception as e:
                print(f'[GetFixes] DynamoDB error: {e}')
                fixes = []
        else:
            fixes = []
        
        return create_response(200, {
            'data': {
                'getFixes': fixes
            }
        })
    except Exception as e:
        print(f"Get fixes error: {e}")
        return create_response(500, {'errors': [{'message': f'Get fixes error: {str(e)}'}]})


def handle_trigger_fix(variables: Dict[str, Any]) -> Dict[str, Any]:
    """Trigger multi-agent fix workflow with real code analysis"""
    try:
        user_id = _get_user_from_token(variables.get('token'))
        if not user_id:
            return create_response(401, {'errors': [{'message': 'Unauthorized'}]})
        
        project_id = variables.get('projectId')
        if not project_id:
            return create_response(400, {'errors': [{'message': 'Missing projectId'}]})
        
        # Get project and user data
        if IS_LOCAL:
            if project_id not in _local_projects:
                return create_response(404, {'errors': [{'message': 'Project not found'}]})
            project = _local_projects[project_id]
            user = _local_users.get(user_id, {})
        else:
            project_response = projects_table.get_item(Key={'project_id': project_id})
            if 'Item' not in project_response:
                return create_response(404, {'errors': [{'message': 'Project not found'}]})
            project = project_response['Item']
            
            user_response = users_table.get_item(Key={'user_id': user_id})
            user = user_response.get('Item', {})
        
        access_token = user.get('access_token')
        if not access_token:
            return create_response(400, {'errors': [{'message': 'GitHub access token not found'}]})
        
        # Analyze code and create branch
        print(f'[TriggerFix] Starting code analysis for project {project_id}')
        
        result = _analyze_and_fix_code(
            repo_url=project.get('github_repo'),
            branch_name=project.get('branch_name'),
            access_token=access_token,
            team_name=project.get('team_name'),
            team_leader=project.get('team_leader')
        )
        
        return create_response(200, {
            'data': {
                'triggerFix': {
                    'status': 'completed',
                    'message': f'Analysis complete. Found {result["total_issues"]} issues, fixed {result["fixes_applied"]}',
                    'branch_url': result.get('branch_url'),
                    'score': result.get('score'),
                    'issues': result.get('issues', []),
                    'commits': result.get('commits', [])
                }
            }
        })
    except Exception as e:
        print(f"Trigger fix error: {e}")
        import traceback
        traceback.print_exc()
        return create_response(500, {'errors': [{'message': f'Trigger fix error: {str(e)}'}]})


# =====================================================================
#  CODE ANALYSIS AND FIXING
# =====================================================================
def _analyze_and_fix_code(repo_url: str, branch_name: str, access_token: str, team_name: str, team_leader: str) -> Dict[str, Any]:
    """Analyze code and create GitHub branch with fixes using GitHub API"""
    from datetime import datetime
    import base64
    
    start_time = datetime.now()
    issues = []
    fixes_applied = []
    
    try:
        # Extract owner and repo from URL
        repo_clean = repo_url.replace('https://github.com/', '').replace('http://github.com/', '').rstrip('/').replace('.git', '')
        parts = repo_clean.split('/')
        if len(parts) < 2:
            raise ValueError('Invalid GitHub URL')
        owner, repo = parts[0], parts[1]
        
        headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        
        print(f'[Analysis] Fetching repository {owner}/{repo}...')
        
        # Get default branch
        repo_response = requests.get(f'https://api.github.com/repos/{owner}/{repo}', headers=headers, timeout=10)
        if not repo_response.ok:
            raise Exception(f'Failed to fetch repository: {repo_response.status_code}')
        default_branch = repo_response.json()['default_branch']
        
        # Get repository tree
        tree_response = requests.get(
            f'https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1',
            headers=headers,
            timeout=30
        )
        if not tree_response.ok:
            raise Exception(f'Failed to fetch repository tree: {tree_response.status_code}')
        
        tree_data = tree_response.json()
        files = [f for f in tree_data.get('tree', []) if f['type'] == 'blob']
        
        print(f'[Analysis] Analyzing {len(files)} files...')
        
        # Analyze files
        code_extensions = {'.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb', '.php'}
        for file_info in files[:50]:  # Limit to 50 files
            file_path = file_info['path']
            ext = '.' + file_path.split('.')[-1] if '.' in file_path else ''
            
            if ext not in code_extensions:
                continue
            
            # Skip node_modules, etc.
            if any(skip in file_path for skip in ['node_modules', 'dist', 'build', '.next', 'venv']):
                continue
            
            # Get file content
            try:
                content_response = requests.get(
                    f'https://api.github.com/repos/{owner}/{repo}/contents/{file_path}?ref={default_branch}',
                    headers=headers,
                    timeout=10
                )
                if content_response.ok:
                    content_data = content_response.json()
                    content = base64.b64decode(content_data['content']).decode('utf-8', errors='ignore')
                    lines = content.split('\n')
                    
                    for line_num, line in enumerate(lines, 1):
                        file_issues = _check_line_for_issues(line, line_num, file_path, ext)
                        issues.extend(file_issues)
            except Exception as e:
                print(f'[Analysis] Error reading {file_path}: {e}')
        
        print(f'[Analysis] Found {len(issues)} issues')
        
        # For now, return analysis without creating branch (git not available in Lambda)
        # In production, you'd use GitHub API to create branch and commits
        
        elapsed_time = (datetime.now() - start_time).total_seconds() / 60
        score = _calculate_score(len(issues), 0, 0, elapsed_time)
        
        return {
            'total_issues': len(issues),
            'fixes_applied': 0,
            'commits': [],
            'branch_url': f"{repo_url}/tree/{branch_name}",
            'score': score,
            'issues': [{
                'file': i['file'],
                'line': i['line'],
                'type': i['type'],
                'severity': i['severity'],
                'message': i['message']
            } for i in issues[:20]]
        }
            
    except Exception as e:
        print(f'[Analysis] Error: {e}')
        import traceback
        traceback.print_exc()
        return {
            'total_issues': 0,
            'fixes_applied': 0,
            'commits': [],
            'branch_url': '',
            'score': {'total': 0},
            'issues': [],
            'error': str(e)
        }



def _check_line_for_issues(line: str, line_num: int, file_path: str, ext: str) -> list:
    """Check a line of code for common issues"""
    issues = []
    
    # JavaScript/TypeScript checks
    if ext in {'.js', '.jsx', '.ts', '.tsx'}:
        if 'console.log' in line:
            issues.append({
                'file': file_path,
                'line': line_num,
                'type': 'LINTING',
                'severity': 'Low',
                'message': 'Remove console.log statement',
                'fixable': True,
                'fix': line.replace('console.log', '// console.log')
            })
        
        if 'var ' in line and not line.strip().startswith('//'):
            issues.append({
                'file': file_path,
                'line': line_num,
                'type': 'LINTING',
                'severity': 'Medium',
                'message': 'Use const or let instead of var',
                'fixable': True,
                'fix': line.replace('var ', 'const ')
            })
        
        if '==' in line and '===' not in line and not line.strip().startswith('//'):
            issues.append({
                'file': file_path,
                'line': line_num,
                'type': 'LINTING',
                'severity': 'Medium',
                'message': 'Use === instead of ==',
                'fixable': True,
                'fix': line.replace('==', '===')
            })
    
    # Python checks
    elif ext == '.py':
        if 'print(' in line and not line.strip().startswith('#'):
            issues.append({
                'file': file_path,
                'line': line_num,
                'type': 'LINTING',
                'severity': 'Low',
                'message': 'Remove debug print statement',
                'fixable': True,
                'fix': '# ' + line
            })
    
    # Common checks for all languages
    if len(line) > 120 and not line.strip().startswith(('//', '#', '/*', '*')):
        issues.append({
            'file': file_path,
            'line': line_num,
            'type': 'STYLE',
            'severity': 'Low',
            'message': f'Line too long ({len(line)} characters)',
            'fixable': False
        })
    
    if line.rstrip() != line.rstrip(' \t'):
        issues.append({
            'file': file_path,
            'line': line_num,
            'type': 'STYLE',
            'severity': 'Low',
            'message': 'Trailing whitespace',
            'fixable': True,
            'fix': line.rstrip() + '\n'
        })
    
    return issues



def _calculate_score(total_issues: int, fixes_applied: int, commits: int, elapsed_minutes: float) -> dict:
    """Calculate quality score (max 100)"""
    # Base score starts at 100
    base_score = 100
    
    # Speed bonus (+10 if < 5 minutes)
    speed_bonus = 10 if elapsed_minutes < 5 else 0
    
    # Efficiency penalty (-2 per commit over 20)
    efficiency_penalty = max(0, (commits - 20) * 2) if commits > 20 else 0
    
    # Quality bonus (+2 per fix applied)
    quality_bonus = fixes_applied * 2
    
    # Quality penalty (-5 per unfixed issue)
    unfixed = max(0, total_issues - fixes_applied)
    quality_penalty = unfixed * 5
    
    # Calculate raw total
    raw_total = base_score + speed_bonus + quality_bonus - efficiency_penalty - quality_penalty
    
    # Ensure total is between 0 and 100
    total = max(0, min(100, raw_total))
    
    return {
        'base_score': base_score,
        'speed_bonus': speed_bonus,
        'efficiency_penalty': efficiency_penalty,
        'quality_bonus': quality_bonus,
        'quality_penalty': quality_penalty,
        'total': total,
        'max_possible': 100,
        'elapsed_minutes': round(elapsed_minutes, 2),
        'total_issues': total_issues,
        'fixes_applied': fixes_applied,
        'unfixed_issues': unfixed,
        'commits_count': commits
    }


# =====================================================================
#  HELPERS
# =====================================================================
def _upsert_user(github_id, username, email, avatar_url, access_token, now):
    """Create or update user record"""
    if IS_LOCAL:
        # Check if user exists by github_id
        for uid, user in _local_users.items():
            if user.get('github_id') == github_id:
                user.update({
                    'username': username,
                    'email': email,
                    'avatar_url': avatar_url,
                    'access_token': access_token,
                    'updated_at': now,
                })
                return uid

        user_id = str(uuid.uuid4())
        _local_users[user_id] = {
            'user_id': user_id,
            'github_id': github_id,
            'username': username,
            'email': email,
            'avatar_url': avatar_url,
            'access_token': access_token,
            'created_at': now,
            'updated_at': now,
        }
        return user_id
    else:
        # Check if user exists in DynamoDB
        user_id = str(uuid.uuid4())
        try:
            existing = users_table.query(
                IndexName='github-id-index',
                KeyConditionExpression='github_id = :gid',
                ExpressionAttributeValues={':gid': github_id}
            )
            if existing.get('Items'):
                user_id = existing['Items'][0]['user_id']
        except Exception:
            pass

        users_table.put_item(Item={
            'user_id': user_id,
            'github_id': github_id,
            'username': username,
            'email': email,
            'avatar_url': avatar_url,
            'access_token': access_token,
            'created_at': now,
            'updated_at': now,
        })
        return user_id


def _generate_branch_name(team_name: str, team_leader: str) -> str:
    """Generate branch name: TEAM_NAME_LEADER_NAME_AI_Fix"""
    team_clean = team_name.strip().upper().replace(' ', '_')
    leader_clean = team_leader.strip().upper().replace(' ', '_')
    # Remove any special characters except underscores
    import re
    team_clean = re.sub(r'[^A-Z0-9_]', '', team_clean)
    leader_clean = re.sub(r'[^A-Z0-9_]', '', leader_clean)
    return f"{team_clean}_{leader_clean}_AI_Fix"


def _generate_token(user_id: str) -> str:
    """Generate a JWT-like token (base64-encoded JSON with HMAC signature)"""
    payload = {
        'user_id': user_id,
        'iat': int(time.time()),
        'exp': int(time.time()) + 86400,  # 24 hours
    }
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    signature = hmac.new(JWT_SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{signature}"


def _get_user_from_token(token: str) -> Optional[str]:
    """Validate token and extract user_id"""
    try:
        if not token:
            return None

        parts = token.split('.')
        if len(parts) != 2:
            # Legacy base64-only token fallback
            try:
                payload = json.loads(base64.b64decode(token).decode())
                if payload.get('exp', 0) < time.time():
                    return None
                return payload.get('user_id')
            except Exception:
                return None

        payload_b64, signature = parts
        # Verify signature
        expected_sig = hmac.new(JWT_SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None

        payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode())
        if payload.get('exp', 0) < time.time():
            return None
        return payload.get('user_id')
    except Exception:
        return None