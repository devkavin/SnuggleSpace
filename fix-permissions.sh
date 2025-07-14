#!/bin/bash

echo "🔧 Fixing Docker permissions and environment setup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if user is in docker group
if ! groups $USER | grep -q docker; then
    print_status "Adding user to docker group..."
    sudo usermod -aG docker $USER
    print_warning "You need to log out and log back in for docker group changes to take effect."
    print_warning "Or run: newgrp docker"
    echo ""
    echo "Please run: newgrp docker"
    echo "Then continue with the deployment."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file from template..."
    cp env.production.template .env
    
    print_warning "Please edit .env file with your production settings:"
    print_warning "  - Set DB_PASSWORD to a secure password"
    print_warning "  - Set CERTBOT_EMAIL to your email address"
    print_warning "  - APP_KEY will be auto-generated"
    
    echo ""
    echo "Edit the .env file now:"
    echo "nano .env"
    echo ""
    echo "After editing, run: ./deploy.sh"
else
    print_status ".env file already exists."
    
    # Check if CERTBOT_EMAIL is set
    if ! grep -q "CERTBOT_EMAIL=" .env || grep -q "CERTBOT_EMAIL=your-email@example.com" .env; then
        print_warning "CERTBOT_EMAIL is not set or still has default value."
        print_warning "Please edit .env file and set CERTBOT_EMAIL to your email address."
        echo ""
        echo "Edit the .env file:"
        echo "nano .env"
    fi
fi

print_status "Docker permissions check completed!" 