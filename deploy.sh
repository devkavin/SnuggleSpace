#!/bin/bash

# SnuggleSpace Production Deployment Script
# Run this script on your Hetzner server

set -e

echo "🚀 Starting SnuggleSpace deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_warning "Docker installed. You may need to log out and back in for group changes to take effect."
fi

# Check if user is in docker group
if ! groups $USER | grep -q docker; then
    print_error "User is not in docker group. Please run: newgrp docker"
    print_error "Or log out and log back in, then run this script again."
    exit 1
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create application directory
APP_DIR="/opt/snugglespace"
print_status "Creating application directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone the repository
if [ ! -d "$APP_DIR/.git" ]; then
    print_status "Cloning SnuggleSpace repository..."
    git clone https://github.com/yourusername/snugglespace.git $APP_DIR
else
    print_status "Repository already exists, pulling latest changes..."
    cd $APP_DIR
    git pull origin main
fi

cd $APP_DIR

# Create production environment file
if [ ! -f ".env" ]; then
    print_status "Creating production environment file..."
    cp env.production.template .env
    
    print_warning "Please edit .env file with your production settings before continuing."
    print_warning "Important settings to configure:"
    print_warning "  - DB_PASSWORD: Set a secure database password"
    print_warning "  - CERTBOT_EMAIL: Set your email for SSL certificates"
    print_warning "  - APP_KEY: Will be auto-generated"
    
    read -p "Press Enter after you've configured the .env file..."
else
    print_status "Environment file already exists."
    
    # Check if CERTBOT_EMAIL is set
    if ! grep -q "CERTBOT_EMAIL=" .env || grep -q "CERTBOT_EMAIL=your-email@example.com" .env; then
        print_warning "CERTBOT_EMAIL is not set or still has default value."
        print_warning "Please edit .env file and set CERTBOT_EMAIL to your email address."
        read -p "Press Enter after you've configured CERTBOT_EMAIL in the .env file..."
    fi
fi

# Create SSL directory
sudo mkdir -p docker/ssl

# Start services (without SSL first)
print_status "Starting services..."
docker-compose -f docker-compose.prod.yml up -d nginx app pgsql redis

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Run database migrations
print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Generate SSL certificate
print_status "Generating SSL certificate..."
docker-compose -f docker-compose.prod.yml run --rm certbot

# Restart nginx with SSL
print_status "Restarting nginx with SSL configuration..."
docker-compose -f docker-compose.prod.yml restart nginx

# Set up automatic SSL renewal
print_status "Setting up automatic SSL renewal..."
sudo tee /etc/cron.d/snugglespace-ssl-renewal << EOF
0 12 * * * cd $APP_DIR && docker-compose -f docker-compose.prod.yml run --rm certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx
EOF

# Create systemd service for auto-start
print_status "Creating systemd service for auto-start..."
sudo tee /etc/systemd/system/snugglespace.service << EOF
[Unit]
Description=SnuggleSpace Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable snugglespace.service
sudo systemctl start snugglespace.service

print_status "🎉 Deployment completed successfully!"
print_status "Your SnuggleSpace application should now be available at: https://snugglespace.devkavin.com"
print_status ""
print_status "Useful commands:"
print_status "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
print_status "  - Stop services: docker-compose -f docker-compose.prod.yml down"
print_status "  - Start services: docker-compose -f docker-compose.prod.yml up -d"
print_status "  - Restart services: sudo systemctl restart snugglespace"
print_status ""
print_status "SSL certificate will be automatically renewed every 60 days." 