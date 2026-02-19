"""
GitHub and S3 Integration for Code Analysis
- Clone repo to S3
- Analyze all files
- Create branch and push fixes
"""

import os
import boto3
import subprocess
import tempfile
import shutil
from typing import Dict, List, Any
from github import Github
import git

s3_client = boto3.client('s3')
S3_BUCKET = os.environ.get('S3_BUCKET', 'vajraopz-code-storage')


def clone_repo_to_s3(repo_url: str, branch: str, access_token: str, deployment_id: str) -> str:
    """Clone GitHub repo to S3"""
    print(f"[S3] Cloning {repo_url} to S3...")
    
    with tempfile.TemporaryDirectory() as tmpdir:
        # Clone repo
        repo_url_with_token = repo_url.replace('https://github.com/', f'https://{access_token}@github.com/')
        git.Repo.clone_from(repo_url_with_token, tmpdir, branch=branch)
        
        # Upload to S3
        s3_prefix = f"deployments/{deployment_id}/code/"
        
        for root, dirs, files in os.walk(tmpdir):
            # Skip .git directory
            if '.git' in root:
                continue
                
            for file in files:
                local_path = os.path.join(root, file)
                relative_path = os.path.relpath(local_path, tmpdir)
                s3_key = f"{s3_prefix}{relative_path}"
                
                s3_client.upload_file(local_path, S3_BUCKET, s3_key)
        
        print(f"[S3] Code uploaded to s3://{S3_BUCKET}/{s3_prefix}")
        return s3_prefix


def read_code_from_s3(s3_prefix: str) -> Dict[str, str]:
    """Read all code files from S3"""
    print(f"[S3] Reading code from {s3_prefix}...")
    
    code_files = {}
    paginator = s3_client.get_paginator('list_objects_v2')
    
    for page in paginator.paginate(Bucket=S3_BUCKET, Prefix=s3_prefix):
        for obj in page.get('Contents', []):
            key = obj['Key']
            
            # Only process code files
            if any(key.endswith(ext) for ext in ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.go', '.rb']):
                response = s3_client.get_object(Bucket=S3_BUCKET, Key=key)
                content = response['Body'].read().decode('utf-8')
                
                # Store with relative path
                relative_path = key.replace(s3_prefix, '')
                code_files[relative_path] = content
    
    print(f"[S3] Read {len(code_files)} code files")
    return code_files


def create_branch_and_push_fixes(
    repo_url: str,
    branch_name: str,
    access_token: str,
    fixes: List[Dict[str, Any]],
    deployment_id: str
) -> List[str]:
    """Create branch and push fixes to GitHub"""
    print(f"[GitHub] Creating branch {branch_name} and pushing fixes...")
    
    commit_shas = []
    
    with tempfile.TemporaryDirectory() as tmpdir:
        # Clone repo
        repo_url_with_token = repo_url.replace('https://github.com/', f'https://{access_token}@github.com/')
        repo = git.Repo.clone_from(repo_url_with_token, tmpdir)
        
        # Create new branch
        try:
            repo.git.checkout('-b', branch_name)
        except:
            # Branch might already exist
            repo.git.checkout(branch_name)
        
        # Apply each fix and commit
        for fix in fixes:
            file_path = os.path.join(tmpdir, fix['file'])
            
            if os.path.exists(file_path):
                # Read file
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Apply fix (simple line replacement for now)
                lines = content.split('\n')
                if 0 < fix['line'] <= len(lines):
                    lines[fix['line'] - 1] = fix['fix']
                    
                    # Write back
                    with open(file_path, 'w') as f:
                        f.write('\n'.join(lines))
                    
                    # Commit
                    repo.index.add([fix['file']])
                    commit_msg = f"{fix['type']} error in {fix['file']} line {fix['line']} → Fix: {fix['message']}"
                    repo.index.commit(commit_msg)
                    
                    commit_shas.append(repo.head.commit.hexsha[:7])
                    print(f"[GitHub] Committed fix: {commit_msg}")
        
        # Push to GitHub
        origin = repo.remote('origin')
        origin.push(branch_name)
        
        print(f"[GitHub] Pushed {len(commit_shas)} commits to {branch_name}")
    
    return commit_shas


def analyze_and_fix_repo(
    repo_url: str,
    branch: str,
    access_token: str,
    deployment_id: str,
    run_id: str,
    team_name: str,
    team_leader: str
) -> Dict[str, Any]:
    """Main function to analyze repo and apply fixes"""
    from multi_agent import run_multi_agent_analysis
    
    # Generate branch name
    branch_name = f"{team_name.upper().replace(' ', '_')}_{team_leader.upper().replace(' ', '_')}_AI_Fix"
    
    # Clone to S3
    s3_prefix = clone_repo_to_s3(repo_url, branch, access_token, deployment_id)
    
    # Read code files
    code_files = read_code_from_s3(s3_prefix)
    
    # Run multi-agent analysis
    analysis_result = run_multi_agent_analysis(
        code_files=code_files,
        deployment_id=deployment_id,
        run_id=run_id,
        repo_url=repo_url,
        branch_name=branch_name
    )
    
    # Create branch and push fixes
    commit_shas = create_branch_and_push_fixes(
        repo_url=repo_url,
        branch_name=branch_name,
        access_token=access_token,
        fixes=analysis_result['selected_fixes'],
        deployment_id=deployment_id
    )
    
    # Update score with commit count
    analysis_result['score']['commits_count'] = len(commit_shas)
    
    return {
        'branch_name': branch_name,
        'commits': commit_shas,
        'fixes_applied': len(analysis_result['selected_fixes']),
        'score': analysis_result['score'],
        'all_fixes': analysis_result['all_fixes']
    }
