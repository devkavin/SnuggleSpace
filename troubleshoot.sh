#!/bin/bash

echo "🔍 SnuggleSpace Troubleshooting Script"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "docker-compose.prod.yml not found. Please run this script from the project root."
    exit 1
fi

print_header "1. Checking Docker services..."
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running or you don't have permission to access it."
    print_warning "Try: sudo systemctl start docker"
    exit 1
fi

# Check container status
print_status "Container status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
print_header "2. Checking service logs..."
echo ""

# Check nginx logs
print_status "Nginx logs (last 10 lines):"
docker-compose -f docker-compose.prod.yml logs --tail=10 nginx

echo ""
print_status "App logs (last 10 lines):"
docker-compose -f docker-compose.prod.yml logs --tail=10 app

echo ""
print_header "3. Checking network ports..."
echo ""

# Check if ports are being listened on
print_status "Checking if ports 80 and 443 are being listened on:"
if command -v netstat >/dev/null 2>&1; then
    netstat -tlnp | grep -E ":80|:443" || print_warning "No processes listening on ports 80/443"
else
    ss -tlnp | grep -E ":80|:443" || print_warning "No processes listening on ports 80/443"
fi

echo ""
print_status "Docker port bindings:"
docker-compose -f docker-compose.prod.yml port nginx 80 2>/dev/null || print_warning "Nginx port 80 not bound"
docker-compose -f docker-compose.prod.yml port nginx 443 2>/dev/null || print_warning "Nginx port 443 not bound"

echo ""
print_header "4. Checking environment configuration..."
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    print_status ".env file exists"
    
    # Check critical environment variables
    if grep -q "CERTBOT_EMAIL=" .env; then
        print_status "CERTBOT_EMAIL is set"
    else
        print_warning "CERTBOT_EMAIL is not set"
    fi
    
    if grep -q "DB_PASSWORD=" .env; then
        print_status "DB_PASSWORD is set"
    else
        print_warning "DB_PASSWORD is not set"
    fi
    
    if grep -q "APP_KEY=" .env; then
        print_status "APP_KEY is set"
    else
        print_warning "APP_KEY is not set"
    fi
else
    print_error ".env file does not exist"
    print_warning "Run: cp env.production.template .env && nano .env"
fi

echo ""
print_header "5. Checking SSL certificates..."
echo ""

# Check if SSL certificates exist
if [ -d "docker/ssl/live/snugglespace.devkavin.com" ]; then
    print_status "SSL certificates directory exists"
    ls -la docker/ssl/live/snugglespace.devkavin.com/
else
    print_warning "SSL certificates not found"
    print_warning "Run: docker-compose -f docker-compose.prod.yml run --rm certbot"
fi

echo ""
print_header "6. Testing local connectivity..."
echo ""

# Test local access
print_status "Testing local HTTP access:"
if curl -s -I http://localhost >/dev/null 2>&1; then
    print_status "HTTP (port 80) is accessible locally"
else
    print_warning "HTTP (port 80) is not accessible locally"
fi

print_status "Testing local HTTPS access:"
if curl -s -I https://localhost >/dev/null 2>&1; then
    print_status "HTTPS (port 443) is accessible locally"
else
    print_warning "HTTPS (port 443) is not accessible locally"
fi

echo ""
print_header "7. Checking DNS resolution..."
echo ""

# Check DNS resolution
print_status "DNS resolution for snugglespace.devkavin.com:"
if command -v nslookup >/dev/null 2>&1; then
    nslookup snugglespace.devkavin.com
else
    print_warning "nslookup not available"
fi

echo ""
print_header "8. Recommendations..."
echo ""

# Provide recommendations based on findings
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_warning "Services are not running. Try:"
    echo "  docker-compose -f docker-compose.prod.yml up -d"
fi

if [ ! -d "docker/ssl/live/snugglespace.devkavin.com" ]; then
    print_warning "SSL certificates missing. Try:"
    echo "  docker-compose -f docker-compose.prod.yml run --rm certbot"
fi

print_status "Common issues to check:"
echo "  1. Hetzner Cloud Console -> Firewall -> Allow ports 80, 443"
echo "  2. Cloudflare DNS settings -> A record pointing to your server IP"
echo "  3. Server firewall: sudo ufw status"
echo "  4. Restart services: docker-compose -f docker-compose.prod.yml restart"

echo ""
print_status "Troubleshooting complete!" 