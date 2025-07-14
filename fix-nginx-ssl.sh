#!/bin/bash

echo "🔧 Fixing Nginx SSL Certificate Issue"
echo "====================================="

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
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_header "1. Stopping all services..."
docker-compose -f docker-compose.prod.yml down

print_header "2. Backing up current nginx config..."
cp docker/nginx/conf.d/default.conf docker/nginx/conf.d/default.conf.backup

print_header "3. Using HTTP-only configuration for SSL generation..."
cp docker/nginx/conf.d/default-http.conf docker/nginx/conf.d/default.conf

print_header "4. Starting services with HTTP-only config..."
docker-compose -f docker-compose.prod.yml up -d nginx app pgsql redis

print_status "Waiting for services to be ready..."
sleep 10

print_header "5. Testing local HTTP access..."
if curl -s -I http://localhost >/dev/null 2>&1; then
    print_status "✅ HTTP is working locally!"
else
    print_error "❌ HTTP is still not working locally"
    print_warning "Let's check the logs:"
    docker-compose -f docker-compose.prod.yml logs nginx
    exit 1
fi

print_header "6. Testing domain access..."
DOMAIN="snugglespace.devkavin.com"
if curl -s -I http://$DOMAIN >/dev/null 2>&1; then
    print_status "✅ Domain is accessible via HTTP!"
else
    print_warning "❌ Domain is not accessible via HTTP"
    print_warning "This might be due to:"
    print_warning "  - DNS not pointing to your server"
    print_warning "  - Hetzner firewall blocking port 80"
    print_warning "  - Cloudflare proxy interfering"
fi

print_header "7. Generating SSL certificate..."
print_status "Running certbot to generate SSL certificate..."
docker-compose -f docker-compose.prod.yml run --rm certbot

if [ $? -eq 0 ]; then
    print_status "✅ SSL certificate generated successfully!"
    
    print_header "8. Restoring full SSL configuration..."
    cp docker/nginx/conf.d/default.conf.backup docker/nginx/conf.d/default.conf
    
    print_header "9. Restarting nginx with SSL..."
    docker-compose -f docker-compose.prod.yml restart nginx
    
    print_status "✅ SSL setup complete!"
    print_status "Your site should now be accessible at: https://$DOMAIN"
else
    print_error "❌ SSL certificate generation failed"
    print_warning "Common issues:"
    print_warning "  1. DNS not pointing to your server IP"
    print_warning "  2. Hetzner firewall blocking port 80"
    print_warning "  3. Cloudflare proxy interfering with verification"
    print_warning ""
    print_warning "To check your server's public IP:"
    echo "curl ifconfig.me"
    print_warning ""
    print_warning "To check DNS resolution:"
    echo "nslookup $DOMAIN"
fi

print_header "10. Final status check..."
docker-compose -f docker-compose.prod.yml ps

echo ""
print_status "If SSL generation failed, you can still access your site via HTTP:"
echo "http://$DOMAIN"
echo ""
print_status "To retry SSL generation later:"
echo "docker-compose -f docker-compose.prod.yml run --rm certbot" 