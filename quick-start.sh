#!/bin/bash

echo "🚀 VajraOpz Quick Start"
echo "======================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check environment file
if [ ! -f ".env.development" ]; then
    echo "⚙️  Creating .env.development..."
    cat > .env.development << EOF
VITE_API_BASE_URL=https://7qwlci3xodqqlvvtupdlhrcume0xntdd.lambda-url.ap-south-1.on.aws
VITE_ENV=development
EOF
    echo "✅ Created .env.development"
    echo ""
fi

echo "🧪 Running integration test..."
bash test-integration.sh
echo ""

echo "✨ Starting development server..."
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API: https://7qwlci3xodqqlvvtupdlhrcume0xntdd.lambda-url.ap-south-1.on.aws"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
