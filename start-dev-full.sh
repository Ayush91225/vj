#!/bin/bash

# VajraOpz - Start Development Environment
# This script starts both backend and frontend servers

set -e

echo "======================================"
echo "  VajraOpz Development Environment"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python3 not found. Please install Python 3.8+${NC}"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check if backend dependencies are installed
if [ ! -d "backend/lambda/api/venv" ]; then
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    cd backend/lambda/api
    python3 -m venv venv
    source venv/bin/activate
    pip install -r dev_requirements.txt
    cd ../../..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    npm install
fi

echo ""
echo -e "${GREEN}✓ All dependencies installed${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${BLUE}🚀 Starting backend server...${NC}"
cd backend/lambda/api
source venv/bin/activate
python dev_server.py &
BACKEND_PID=$!
cd ../../..

# Wait for backend to start
sleep 3

# Start frontend
echo -e "${BLUE}🚀 Starting frontend server...${NC}"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "======================================"
echo -e "${GREEN}✓ Development servers running${NC}"
echo "======================================"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001/graphql"
echo "  Health:    http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
