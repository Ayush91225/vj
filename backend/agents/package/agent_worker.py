#!/usr/bin/env python3
"""
AI Agent Worker - Runs code analysis and fixes
Deployed as Lambda or ECS task
"""

import os
import json
import boto3
import requests
from datetime import datetime
from typing import Dict, List, Any
import anthropic
import google.generativeai as genai

# AWS Clients
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# Environment
S3_BUCKET = os.environ.get('S3_BUCKET', 'vajraopz-prod-code-storage')
DEPLOYMENTS_TABLE = os.environ.get('DEPLOYMENTS_TABLE', 'vajraopz-prod-deployments')
PROJECTS_TABLE = os.environ.get('PROJECTS_TABLE', 'vajraopz-prod-projects')

# AI API Keys
CLAUDE_API_KEY = os.environ.get('CLAUDE_API_KEY')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY')

# Initialize AI clients
claude_client = anthropic.Anthropic(api_key=CLAUDE_API_KEY) if CLAUDE_API_KEY else None
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def lambda_handler(event, context):
    """Lambda entry point"""
    try:
        project_id = event.get('project_id')
        deployment_id = event.get('deployment_id')
        
        print(f"[Worker] Starting analysis for project {project_id}")
        
        # Get project details
        projects_table = dynamodb.Table(PROJECTS_TABLE)
        project = projects_table.get_item(Key={'project_id': project_id})['Item']
        
        # Run analysis
        result = run_analysis_and_fix(
            project_id=project_id,
            deployment_id=deployment_id,
            repo_url=project['github_repo'],
            branch_name=project['branch_name'],
            access_token=project.get('access_token'),
            team_name=project['team_name'],
            team_leader=project['team_leader']
        )
        
        # Save results to DynamoDB
        save_deployment_results(deployment_id, result)
        
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
        
    except Exception as e:
        print(f"[Worker] Error: {e}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


def run_analysis_and_fix(project_id, deployment_id, repo_url, branch_name, access_token, team_name, team_leader):
    """Main workflow: Clone → Analyze → Fix → Push"""
    start_time = datetime.now()
    
    # Step 1: Clone repo to S3
    print(f"[Worker] Cloning {repo_url} to S3...")
    code_files = clone_repo_to_s3(repo_url, deployment_id, access_token)
    
    # Step 2: Analyze with AI agents
    print(f"[Worker] Analyzing {len(code_files)} files...")
    issues = analyze_with_agents(code_files)
    
    # Step 3: Generate fixes
    print(f"[Worker] Generating fixes for {len(issues)} issues...")
    fixes = generate_fixes(issues, code_files)
    
    # Step 4: Create branch and push fixes
    print(f"[Worker] Creating branch and pushing fixes...")
    commits = push_fixes_to_github(
        repo_url=repo_url,
        branch_name=branch_name,
        fixes=fixes,
        access_token=access_token
    )
    
    # Step 5: Calculate score
    elapsed_minutes = (datetime.now() - start_time).total_seconds() / 60
    score = calculate_score(
        total_issues=len(issues),
        fixes_applied=len(fixes),
        commits_count=len(commits),
        elapsed_minutes=elapsed_minutes
    )
    
    return {
        'deployment_id': deployment_id,
        'issues': issues,
        'fixes': fixes,
        'commits': commits,
        'score': score,
        'branch_url': f"{repo_url}/tree/{branch_name}",
        'elapsed_minutes': elapsed_minutes
    }


def clone_repo_to_s3(repo_url, deployment_id, access_token):
    """Clone GitHub repo and upload to S3"""
    import tempfile
    import shutil
    import subprocess
    
    code_files = {}
    
    with tempfile.TemporaryDirectory() as tmpdir:
        # Clone repo
        auth_url = repo_url.replace('https://', f'https://{access_token}@')
        subprocess.run(['git', 'clone', '--depth', '1', auth_url, tmpdir], check=True)
        
        # Upload to S3 and read code files
        s3_prefix = f"deployments/{deployment_id}/code/"
        
        for root, dirs, files in os.walk(tmpdir):
            # Skip .git
            if '.git' in root:
                continue
            
            for file in files:
                local_path = os.path.join(root, file)
                relative_path = os.path.relpath(local_path, tmpdir)
                
                # Only process code files
                if any(relative_path.endswith(ext) for ext in ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.go', '.rb', '.php', '.c', '.cpp', '.cs']):
                    try:
                        with open(local_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            code_files[relative_path] = content
                        
                        # Upload to S3
                        s3_key = f"{s3_prefix}{relative_path}"
                        s3.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=content)
                    except Exception as e:
                        print(f"[S3] Error reading {relative_path}: {e}")
    
    print(f"[S3] Uploaded {len(code_files)} files to s3://{S3_BUCKET}/{s3_prefix}")
    return code_files


def analyze_with_agents(code_files):
    """Analyze code with multiple AI agents"""
    all_issues = []
    
    # Limit to first 20 files for demo
    files_to_analyze = list(code_files.items())[:20]
    
    for file_path, content in files_to_analyze:
        print(f"[Analysis] Analyzing {file_path}...")
        
        # Claude Analysis
        if claude_client:
            claude_issues = analyze_with_claude(file_path, content)
            all_issues.extend(claude_issues)
        
        # Gemini Analysis
        if GEMINI_API_KEY:
            gemini_issues = analyze_with_gemini(file_path, content)
            all_issues.extend(gemini_issues)
        
        # OpenRouter Analysis
        if OPENROUTER_API_KEY:
            openrouter_issues = analyze_with_openrouter(file_path, content)
            all_issues.extend(openrouter_issues)
    
    # Deduplicate issues
    unique_issues = deduplicate_issues(all_issues)
    
    print(f"[Analysis] Found {len(unique_issues)} unique issues")
    return unique_issues


def analyze_with_claude(file_path, content):
    """Analyze code with Claude"""
    try:
        prompt = f"""Analyze this code file for issues. Return ONLY a JSON array of issues.

File: {file_path}

Code:
```
{content[:3000]}
```

Return format:
[
  {{"file": "{file_path}", "line": 10, "type": "LINTING", "severity": "Medium", "message": "Issue description", "suggestion": "How to fix"}}
]

Types: LINTING, SYNTAX, LOGIC, STYLE
Severity: Low, Medium, High, Critical"""

        message = claude_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}]
        )
        
        response_text = message.content[0].text
        # Extract JSON from response
        import re
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            issues = json.loads(json_match.group())
            return issues
        return []
        
    except Exception as e:
        print(f"[Claude] Error: {e}")
        return []


def analyze_with_gemini(file_path, content):
    """Analyze code with Gemini"""
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""Analyze this code for issues. Return ONLY a JSON array.

File: {file_path}
Code: {content[:3000]}

Format: [{{"file": "{file_path}", "line": 10, "type": "LINTING", "severity": "Medium", "message": "...", "suggestion": "..."}}]"""

        response = model.generate_content(prompt)
        
        import re
        json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
        if json_match:
            issues = json.loads(json_match.group())
            return issues
        return []
        
    except Exception as e:
        print(f"[Gemini] Error: {e}")
        return []


def analyze_with_openrouter(file_path, content):
    """Analyze code with OpenRouter"""
    try:
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'anthropic/claude-3.5-sonnet',
                'messages': [{
                    'role': 'user',
                    'content': f"Analyze {file_path} for code issues. Return JSON array: [{{'file': '{file_path}', 'line': 10, 'type': 'LINTING', 'severity': 'Medium', 'message': '...', 'suggestion': '...'}}]\n\nCode:\n{content[:3000]}"
                }]
            },
            timeout=30
        )
        
        result = response.json()
        content_text = result['choices'][0]['message']['content']
        
        import re
        json_match = re.search(r'\[.*\]', content_text, re.DOTALL)
        if json_match:
            issues = json.loads(json_match.group())
            return issues
        return []
        
    except Exception as e:
        print(f"[OpenRouter] Error: {e}")
        return []


def deduplicate_issues(issues):
    """Remove duplicate issues"""
    seen = set()
    unique = []
    
    for issue in issues:
        key = (issue['file'], issue['line'], issue['message'])
        if key not in seen:
            seen.add(key)
            unique.append(issue)
    
    return unique


def generate_fixes(issues, code_files):
    """Generate code fixes for issues"""
    fixes = []
    
    for issue in issues[:10]:  # Limit to 10 fixes
        file_path = issue['file']
        if file_path not in code_files:
            continue
        
        content = code_files[file_path]
        lines = content.split('\n')
        line_num = issue.get('line', 1)
        
        if 0 < line_num <= len(lines):
            old_line = lines[line_num - 1]
            new_line = apply_fix_suggestion(old_line, issue)
            
            fixes.append({
                'file': file_path,
                'line': line_num,
                'type': issue['type'],
                'severity': issue['severity'],
                'message': issue['message'],
                'old_code': old_line,
                'new_code': new_line
            })
    
    return fixes


def apply_fix_suggestion(line, issue):
    """Apply simple fix based on issue type"""
    suggestion = issue.get('suggestion', '')
    
    # Simple fixes
    if 'console.log' in line:
        return line.replace('console.log', '// console.log')
    elif 'var ' in line:
        return line.replace('var ', 'const ')
    elif '==' in line and '===' not in line:
        return line.replace('==', '===')
    elif 'print(' in line and not line.strip().startswith('#'):
        return '# ' + line
    else:
        return line.rstrip()  # Remove trailing whitespace


def push_fixes_to_github(repo_url, branch_name, fixes, access_token):
    """Create branch and push fixes to GitHub"""
    import tempfile
    import subprocess
    
    commits = []
    
    with tempfile.TemporaryDirectory() as tmpdir:
        try:
            # Clone repo
            auth_url = repo_url.replace('https://', f'https://{access_token}@')
            subprocess.run(['git', 'clone', auth_url, tmpdir], check=True, capture_output=True)
            
            os.chdir(tmpdir)
            
            # Create and checkout branch
            subprocess.run(['git', 'checkout', '-b', branch_name], check=True, capture_output=True)
            
            # Apply each fix and commit
            for fix in fixes:
                file_path = os.path.join(tmpdir, fix['file'])
                
                if os.path.exists(file_path):
                    with open(file_path, 'r') as f:
                        lines = f.readlines()
                    
                    line_num = fix['line']
                    if 0 < line_num <= len(lines):
                        lines[line_num - 1] = fix['new_code'] + '\n'
                        
                        with open(file_path, 'w') as f:
                            f.writelines(lines)
                        
                        # Commit
                        subprocess.run(['git', 'add', fix['file']], check=True, capture_output=True)
                        commit_msg = f"Fix {fix['type']}: {fix['message'][:50]}"
                        subprocess.run(['git', 'commit', '-m', commit_msg], check=True, capture_output=True)
                        
                        # Get commit SHA
                        result = subprocess.run(['git', 'rev-parse', 'HEAD'], capture_output=True, text=True, check=True)
                        sha = result.stdout.strip()[:7]
                        
                        commits.append({
                            'sha': sha,
                            'message': commit_msg,
                            'file': fix['file'],
                            'line': fix['line']
                        })
            
            # Push to GitHub
            if commits:
                subprocess.run(['git', 'push', 'origin', branch_name], check=True, capture_output=True)
                print(f"[GitHub] Pushed {len(commits)} commits to {branch_name}")
            
        except Exception as e:
            print(f"[GitHub] Error: {e}")
            import traceback
            traceback.print_exc()
    
    return commits


def calculate_score(total_issues, fixes_applied, commits_count, elapsed_minutes):
    """Calculate quality score"""
    base_score = 100
    speed_bonus = 10 if elapsed_minutes < 5 else 0
    quality_bonus = fixes_applied * 2
    efficiency_penalty = max(0, (commits_count - 20) * 2)
    unfixed = max(0, total_issues - fixes_applied)
    quality_penalty = unfixed * 5
    
    total = max(0, min(100, base_score + speed_bonus + quality_bonus - efficiency_penalty - quality_penalty))
    
    return {
        'base_score': base_score,
        'speed_bonus': speed_bonus,
        'quality_bonus': quality_bonus,
        'efficiency_penalty': -efficiency_penalty,
        'quality_penalty': -quality_penalty,
        'total': total,
        'elapsed_minutes': round(elapsed_minutes, 2),
        'total_issues': total_issues,
        'fixes_applied': fixes_applied,
        'unfixed_issues': unfixed,
        'commits_count': commits_count
    }


def save_deployment_results(deployment_id, result):
    """Save results to DynamoDB"""
    deployments_table = dynamodb.Table(DEPLOYMENTS_TABLE)
    
    deployments_table.update_item(
        Key={'deployment_id': deployment_id},
        UpdateExpression='SET #status = :status, issues = :issues, fixes = :fixes, commits = :commits, score = :score, branch_url = :branch_url, updated_at = :updated_at',
        ExpressionAttributeNames={'#status': 'status'},
        ExpressionAttributeValues={
            ':status': 'completed',
            ':issues': result['issues'],
            ':fixes': result['fixes'],
            ':commits': result['commits'],
            ':score': result['score'],
            ':branch_url': result['branch_url'],
            ':updated_at': datetime.now().isoformat()
        }
    )
    
    print(f"[DynamoDB] Saved results for deployment {deployment_id}")


if __name__ == '__main__':
    # For local testing
    event = {
        'project_id': 'test-project',
        'deployment_id': 'test-deployment'
    }
    lambda_handler(event, None)
