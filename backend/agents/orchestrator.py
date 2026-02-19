"""
Agent Orchestrator Lambda Function
Triggered when user clicks "Fix" button
1. Clone repo to S3
2. Analyze with LangGraph agents
3. CTO decides fixes
4. Push to branch
"""

import json
import os
import boto3
from datetime import datetime, timezone

# Import agent modules
import sys
sys.path.append('/opt/python')

from github_integration import analyze_and_fix_repo
from dynamodb_helper import save_analysis, save_fixes, save_score

dynamodb = boto3.resource('dynamodb')
projects_table = dynamodb.Table(os.environ.get('PROJECTS_TABLE', 'vajraopz-projects'))
users_table = dynamodb.Table(os.environ.get('USERS_TABLE', 'vajraopz-users'))


def lambda_handler(event, context):
    """Main handler for agent orchestration"""
    try:
        body = json.loads(event.get('body', '{}'))
        project_id = body.get('projectId')
        token = body.get('token')
        
        if not project_id or not token:
            return create_response(400, {'error': 'Missing projectId or token'})
        
        # Get user from token
        user_id = validate_token(token)
        if not user_id:
            return create_response(401, {'error': 'Unauthorized'})
        
        # Get user's GitHub access token
        user = users_table.get_item(Key={'user_id': user_id})
        if 'Item' not in user:
            return create_response(404, {'error': 'User not found'})
        
        github_token = user['Item'].get('access_token')
        if not github_token:
            return create_response(400, {'error': 'GitHub token not found'})
        
        # Get project details
        project = projects_table.get_item(Key={'project_id': project_id})
        if 'Item' not in project:
            return create_response(404, {'error': 'Project not found'})
        
        project_data = project['Item']
        
        # Generate deployment ID
        deployment_id = f"dep_{project_id}_{int(datetime.now().timestamp())}"
        run_id = f"run_{deployment_id}"
        
        print(f"[Orchestrator] Starting analysis for project {project_id}")
        print(f"[Orchestrator] Deployment ID: {deployment_id}")
        
        # Run multi-agent analysis and fix
        result = analyze_and_fix_repo(
            repo_url=project_data['github_repo'],
            branch=project_data.get('branch_name', 'main'),
            access_token=github_token,
            deployment_id=deployment_id,
            run_id=run_id,
            team_name=project_data['team_name'],
            team_leader=project_data['team_leader']
        )
        
        # Save results to DynamoDB
        save_analysis(deployment_id, run_id, {
            'branch_name': result['branch_name'],
            'commits_count': len(result['commits']),
            'fixes_applied': result['fixes_applied']
        })
        
        # Save fixes
        if result.get('all_fixes'):
            all_selected_fixes = []
            for agent_name, fixes in result['all_fixes'].items():
                all_selected_fixes.extend(fixes)
            save_fixes(deployment_id, all_selected_fixes)
        
        # Save score
        save_score(deployment_id, result['score'])
        
        print(f"[Orchestrator] Analysis complete. Score: {result['score']['total']}/100")
        
        return create_response(200, {
            'success': True,
            'deployment_id': deployment_id,
            'branch_name': result['branch_name'],
            'commits': result['commits'],
            'fixes_applied': result['fixes_applied'],
            'score': result['score']
        })
        
    except Exception as e:
        print(f"[Orchestrator] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return create_response(500, {'error': str(e)})


def validate_token(token):
    """Validate JWT token and return user_id"""
    import base64
    import hmac
    import hashlib
    import time
    
    JWT_SECRET = os.environ.get('JWT_SECRET', 'vajraopz-dev-secret-key')
    
    try:
        parts = token.split('.')
        if len(parts) != 2:
            return None
        
        payload_b64, signature = parts
        expected_sig = hmac.new(JWT_SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        
        if not hmac.compare_digest(signature, expected_sig):
            return None
        
        payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode())
        if payload.get('exp', 0) < time.time():
            return None
        
        return payload.get('user_id')
    except:
        return None


def create_response(status_code, body):
    """Create API response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body)
    }
