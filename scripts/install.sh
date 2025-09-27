#!/bin/bash

# WSAPI MCP Server Installation Script

set -e

echo "🚀 Installing WSAPI MCP Server..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.0.0 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! npx semver-compare $NODE_VERSION $REQUIRED_VERSION &> /dev/null; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please install Node.js $REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate types from OpenAPI specs
echo "🔧 Generating TypeScript types..."
npm run generate-types

# Build the project
echo "🔨 Building the project..."
npm run build

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your WSAPI credentials"
else
    echo "✅ .env file already exists"
fi

# Create logs directory
mkdir -p logs
echo "✅ Created logs directory"

echo "✅ Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your WSAPI credentials"
echo "2. Run 'npm start' to start the server"
echo "3. Configure your MCP client to use this server"
echo ""
echo "📚 Documentation: README.md"
echo "💡 Examples: examples/"