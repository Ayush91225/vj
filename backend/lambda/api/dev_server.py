"""
VajraOpz Local Development Server
Wraps the Lambda handler in a Flask server for local dev.
Run: python dev_server.py
Serves GraphQL at http://localhost:3001/graphql
"""

import os
import json
import sys

# Set local mode BEFORE importing handler
os.environ['IS_LOCAL'] = 'true'
os.environ.setdefault('GITHUB_CLIENT_ID', 'Iv23liqkVfyeR5Wi86hU')
os.environ.setdefault('GITHUB_CLIENT_SECRET', '991ec85a058dbfad3b9bdfab5f6bd290ff8b7d65')
os.environ.setdefault('FRONTEND_URL', 'http://localhost:3000')
os.environ.setdefault('CALLBACK_URL', 'http://localhost:3000/auth/callback')

from flask import Flask, request, jsonify
from flask_cors import CORS
from handler import route_graphql

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/graphql', methods=['POST', 'OPTIONS'])
def graphql_endpoint():
    """GraphQL endpoint"""
    if request.method == 'OPTIONS':
        return '', 200

    body = request.get_json(force=True, silent=True) or {}
    result = route_graphql(body)

    response_body = json.loads(result.get('body', '{}'))
    return jsonify(response_body), result.get('statusCode', 200)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'vajraopz-backend',
        'mode': 'local-development',
        'github_client_id': os.environ.get('GITHUB_CLIENT_ID', 'not-set'),
    })


if __name__ == '__main__':
    print("=" * 60)
    print("  VajraOpz Backend — Local Development Server")
    print("=" * 60)
    print(f"  GraphQL:  http://localhost:3001/graphql")
    print(f"  Health:   http://localhost:3001/health")
    print(f"  Frontend: {os.environ.get('FRONTEND_URL')}")
    print(f"  Callback: {os.environ.get('CALLBACK_URL')}")
    print(f"  GitHub Client ID: {os.environ.get('GITHUB_CLIENT_ID')}")
    print("=" * 60)
    app.run(host='0.0.0.0', port=3001, debug=True, use_reloader=False)
