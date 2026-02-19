#!/bin/bash

echo "🚀 Starting VajraOpz Development Environment"
echo "==========================================="

# Check if setup has been run
if [ ! -f ".env.development" ]; then
    echo "⚠️  Development environment not set up yet"
    echo "Please run: cd backend && ./setup-dev.sh"
    exit 1
fi

# Check if GitHub OAuth is configured
if [ -z "$GITHUB_CLIENT_ID" ] || [ -z "$GITHUB_CLIENT_SECRET" ]; then
    echo "⚠️  GitHub OAuth environment variables not set"
    echo "Please set:"
    echo "  export GITHUB_CLIENT_ID=your_dev_client_id"
    echo "  export GITHUB_CLIENT_SECRET=your_dev_client_secret"
    exit 1
fi

echo "✅ Environment configured"
echo ""
echo "Starting development servers..."
echo ""
echo "📍 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001/graphql"
echo ""
echo "🔧 To start manually:"
echo "  Backend:  cd backend/lambda/api && python dev_server.py"
echo "  Frontend: npm run dev"
echo ""

# Start backend in background
echo "🐍 Starting backend server..."
cd backend/lambda/api
python dev_server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "⚛️  Starting frontend server..."
cd ../../..
npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo ""
echo "✅ Development servers started!"
echo "Press Ctrl+C to stop all servers"

# Wait for processes
wait