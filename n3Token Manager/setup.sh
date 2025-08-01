#!/bin/bash

# Twitch Token & Proxy Manager Setup Script
# This script helps set up the application for deployment

set -e

echo "🚀 Setting up Twitch Token & Proxy Manager..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the application!"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create uploads directory
mkdir -p uploads
echo "✅ Created uploads directory"

# Build the application
echo "🔨 Building application..."
npm run build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Set up your PostgreSQL database"
echo "3. Run 'npm run db:push' to set up database schema"
echo "4. Start the application with 'npm start'"
echo ""
echo "For detailed deployment instructions, see deployment-guide.md"