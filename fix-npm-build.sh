#!/bin/bash

echo "🔧 Fixing npm build issue..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "The npm build failed because vite is a dev dependency."
print_status "I've updated the Dockerfiles to install all dependencies for building."

echo ""
print_status "Options to fix this:"
echo "1. Use the updated Dockerfile (recommended)"
echo "2. Use the optimized multi-stage Dockerfile"
echo "3. Build assets locally and copy them"

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        print_status "Using updated Dockerfile with npm ci && npm run build && npm prune --production..."
        print_status "This installs all dependencies, builds, then removes dev dependencies."
        print_status "Try building again:"
        echo ""
        echo "docker-compose -f docker-compose.prod.yml build --no-cache"
        echo "docker-compose -f docker-compose.prod.yml up -d"
        ;;
    2)
        print_status "Using optimized multi-stage Dockerfile..."
        print_status "This separates the build process from the runtime for better optimization."
        print_status "Updating docker-compose.prod.yml to use the optimized Dockerfile..."
        
        # Update docker-compose to use the optimized Dockerfile
        sed -i 's|dockerfile: ./docker/php/Dockerfile|dockerfile: ./docker/php/Dockerfile.optimized|g' docker-compose.prod.yml
        
        print_status "Now try building again:"
        echo ""
        echo "docker-compose -f docker-compose.prod.yml build --no-cache"
        echo "docker-compose -f docker-compose.prod.yml up -d"
        ;;
    3)
        print_status "Building assets locally and copying them..."
        print_status "This approach builds assets on your local machine first."
        
        # Check if we're in the right directory
        if [ ! -f "package.json" ]; then
            print_error "package.json not found. Please run this script from the project root."
            exit 1
        fi
        
        print_status "Building assets locally..."
        npm ci
        npm run build
        
        if [ $? -eq 0 ]; then
            print_status "Assets built successfully!"
            print_status "Now you can use the updated Dockerfile which will copy the built assets."
            print_status "Try building again:"
            echo ""
            echo "docker-compose -f docker-compose.prod.yml build --no-cache"
            echo "docker-compose -f docker-compose.prod.yml up -d"
        else
            print_error "Failed to build assets locally. Please check your npm setup."
            exit 1
        fi
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
print_status "If you still encounter issues, you can also try:"
echo "1. Building with more verbose output: docker-compose -f docker-compose.prod.yml build --no-cache --progress=plain"
echo "2. Building just the app service: docker-compose -f docker-compose.prod.yml build --no-cache app"
echo "3. Checking if vite is properly configured in package.json" 