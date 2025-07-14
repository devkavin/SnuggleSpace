#!/bin/bash

echo "🔧 Fixing Redis build issue..."

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

print_status "The Redis extension build failed due to missing autoconf."
print_status "I've updated the Dockerfile to include the necessary build dependencies."

echo ""
print_status "Options to fix this:"
echo "1. Use the updated Dockerfile (recommended)"
echo "2. Use the simple Dockerfile alternative"
echo "3. Skip Redis for now and use file-based sessions"

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        print_status "Using updated Dockerfile with build dependencies..."
        print_status "The Dockerfile has been updated with autoconf, gcc, g++, and make."
        print_status "Try building again:"
        echo ""
        echo "docker-compose -f docker-compose.prod.yml build --no-cache"
        echo "docker-compose -f docker-compose.prod.yml up -d"
        ;;
    2)
        print_status "Using simple Dockerfile alternative..."
        print_status "This version tries docker-php-ext-install first, then falls back to pecl."
        print_status "Updating docker-compose.prod.yml to use the simple Dockerfile..."
        
        # Update docker-compose to use the simple Dockerfile
        sed -i 's|dockerfile: ./docker/php/Dockerfile|dockerfile: ./docker/php/Dockerfile.simple|g' docker-compose.prod.yml
        
        print_status "Now try building again:"
        echo ""
        echo "docker-compose -f docker-compose.prod.yml build --no-cache"
        echo "docker-compose -f docker-compose.prod.yml up -d"
        ;;
    3)
        print_status "Skipping Redis and using file-based sessions..."
        print_status "This will work but won't have Redis caching."
        
        # Update .env to use file sessions
        if [ -f ".env" ]; then
            sed -i 's/CACHE_DRIVER=redis/CACHE_DRIVER=file/g' .env
            sed -i 's/SESSION_DRIVER=redis/SESSION_DRIVER=file/g' .env
            print_status "Updated .env to use file-based sessions."
        fi
        
        print_status "Now try building again:"
        echo ""
        echo "docker-compose -f docker-compose.prod.yml build --no-cache"
        echo "docker-compose -f docker-compose.prod.yml up -d"
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
echo "3. Using a different base image by modifying the Dockerfile" 