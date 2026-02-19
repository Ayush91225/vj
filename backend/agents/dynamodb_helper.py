"""
DynamoDB Helper for storing analysis data
Tables:
- vajraopz-analysis: Store code analysis results
- vajraopz-fixes: Store individual fixes
- vajraopz-scores: Store quality scores
"""

import boto3
from datetime import datetime, timezone
from typing import Dict, List, Any
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')

analysis_table = dynamodb.Table('vajraopz-analysis')
fixes_table = dynamodb.Table('vajraopz-fixes')
scores_table = dynamodb.Table('vajraopz-scores')


def save_analysis(deployment_id: str, run_id: str, data: Dict[str, Any]):
    """Save analysis results"""
    analysis_table.put_item(Item={
        'deployment_id': deployment_id,
        'run_id': run_id,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'branch_name': data['branch_name'],
        'commits_count': data['commits_count'],
        'fixes_applied': data['fixes_applied'],
        'status': 'completed'
    })


def save_fixes(deployment_id: str, fixes: List[Dict[str, Any]]):
    """Save individual fixes"""
    for i, fix in enumerate(fixes):
        fixes_table.put_item(Item={
            'deployment_id': deployment_id,
            'fix_id': f"{deployment_id}_{i}",
            'file': fix['file'],
            'line': fix['line'],
            'type': fix['type'],
            'message': fix['message'],
            'fix_code': fix['fix'],
            'agent': fix['agent'],
            'timestamp': datetime.now(timezone.utc).isoformat()
        })


def save_score(deployment_id: str, score: Dict[str, int]):
    """Save quality score"""
    scores_table.put_item(Item={
        'deployment_id': deployment_id,
        'base_score': Decimal(str(score['base'])),
        'speed_bonus': Decimal(str(score['speed_bonus'])),
        'efficiency_penalty': Decimal(str(score['efficiency_penalty'])),
        'quality_bonus': Decimal(str(score['quality_bonus'])),
        'total_score': Decimal(str(score['total'])),
        'timestamp': datetime.now(timezone.utc).isoformat()
    })


def get_analysis(deployment_id: str) -> Dict[str, Any]:
    """Get analysis results"""
    response = analysis_table.get_item(Key={'deployment_id': deployment_id})
    return response.get('Item', {})


def get_fixes(deployment_id: str) -> List[Dict[str, Any]]:
    """Get all fixes for a deployment"""
    response = fixes_table.query(
        KeyConditionExpression='deployment_id = :did',
        ExpressionAttributeValues={':did': deployment_id}
    )
    return response.get('Items', [])


def get_score(deployment_id: str) -> Dict[str, Any]:
    """Get quality score"""
    response = scores_table.get_item(Key={'deployment_id': deployment_id})
    return response.get('Item', {})
