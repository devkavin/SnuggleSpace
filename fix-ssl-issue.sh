#!/bin/bash

echo "🔒 Fixing SSL Certificate Issues"
echo "================================"

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

DOMAIN="snugglespace.devkavin.com"

print_header "1. Checking DNS resolution..."
echo ""

# Get server's public IP
SERVER_IP=$(curl -s ifconfig.me)
print_status "Your server's public IP: $SERVER_IP"

# Check DNS resolution
print_status "DNS resolution for $DOMAIN:"
if command -v nslookup >/dev/null 2>&1; then
    DNS_RESULT=$(nslookup $DOMAIN 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    print_status "Domain resolves to: $DNS_RESULT"
    
    if [ "$DNS_RESULT" = "$SERVER_IP" ]; then
        print_status "✅ DNS is correctly configured!"
    else
        print_error "❌ DNS is NOT correctly configured!"
        print_warning "Domain resolves to: $DNS_RESULT"
        print_warning "But your server IP is: $SERVER_IP"
        print_warning "Please update your DNS records in Cloudflare."
    fi
else
    print_warning "nslookup not available"
fi

echo ""
print_header "2. Checking network connectivity..."
echo ""

# Check if ports are open
print_status "Checking if ports 80 and 443 are accessible:"
if curl -s --connect-timeout 5 http://$DOMAIN >/dev/null 2>&1; then
    print_status "✅ Port 80 is accessible"
else
    print_warning "❌ Port 80 is not accessible"
fi

if curl -s --connect-timeout 5 https://$DOMAIN >/dev/null 2>&1; then
    print_status "✅ Port 443 is accessible"
else
    print_warning "❌ Port 443 is not accessible"
fi

echo ""
print_header "3. Checking local services..."
echo ""

# Check if nginx is running
if docker ps | grep -q nginx; then
    print_status "✅ Nginx container is running"
else
    print_error "❌ Nginx container is not running"
fi

# Check if ports are being listened on
print_status "Checking local port bindings:"
if command -v netstat >/dev/null 2>&1; then
    if netstat -tlnp | grep -q ":80 "; then
        print_status "✅ Port 80 is being listened on"
    else
        print_warning "❌ Port 80 is not being listened on"
    fi
    
    if netstat -tlnp | grep -q ":443 "; then
        print_status "✅ Port 443 is being listened on"
    else
        print_warning "❌ Port 443 is not being listened on"
    fi
else
    print_warning "netstat not available"
fi

echo ""
print_header "4. Testing local access..."
echo ""

# Test local access
print_status "Testing local HTTP access:"
if curl -s -I http://localhost >/dev/null 2>&1; then
    print_status "✅ HTTP works locally"
else
    print_warning "❌ HTTP doesn't work locally"
fi

print_status "Testing local HTTPS access:"
if curl -s -I https://localhost >/dev/null 2>&1; then
    print_status "✅ HTTPS works locally"
else
    print_warning "❌ HTTPS doesn't work locally"
fi

echo ""
print_header "5. Recommendations..."
echo ""

print_status "To fix SSL issues, follow these steps:"
echo ""
echo "1. 🔧 Fix DNS (if needed):"
echo "   - Go to Cloudflare DNS settings"
echo "   - Ensure A record points to: $SERVER_IP"
echo "   - Make sure Cloudflare proxy is OFF (gray cloud icon)"
echo ""
echo "2. 🔥 Fix Hetzner Firewall:"
echo "   - Go to: https://console.hetzner.cloud/"
echo "   - Select your server → Firewall tab"
echo "   - Add rules for ports 80, 443 (Allow from Any)"
echo ""
echo "3. 🔄 Restart services:"
echo "   docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "4. 🔒 Generate SSL certificate:"
echo "   docker-compose -f docker-compose.prod.yml run --rm certbot"
echo ""

print_status "Common issues:"
echo "  - Cloudflare proxy interfering with SSL verification"
echo "  - Hetzner firewall blocking ports 80/443"
echo "  - DNS not pointing to correct server IP"
echo "  - Services not running properly"

echo ""
print_status "After fixing the issues above, try generating SSL again!" 