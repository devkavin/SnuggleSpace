#!/bin/bash

echo "🔍 Diagnosing SSL 403 Error"
echo "==========================="

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

print_header "1. Checking server IP and DNS..."
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
print_header "2. Testing ACME challenge path..."
echo ""

# Test ACME challenge path
print_status "Testing ACME challenge path:"
ACME_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/.well-known/acme-challenge/test)
print_status "ACME challenge test returned: $ACME_TEST"

if [ "$ACME_TEST" = "404" ]; then
    print_status "✅ ACME challenge path is accessible (404 is expected for non-existent file)"
elif [ "$ACME_TEST" = "403" ]; then
    print_error "❌ ACME challenge path is returning 403 Forbidden"
    print_warning "This is likely due to Cloudflare proxy or nginx configuration"
else
    print_warning "ACME challenge path returned: $ACME_TEST"
fi

echo ""
print_header "3. Testing root path..."
echo ""

# Test root path
print_status "Testing root path:"
ROOT_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/)
print_status "Root path returned: $ROOT_TEST"

if [ "$ROOT_TEST" = "200" ]; then
    print_status "✅ Root path is accessible"
elif [ "$ROOT_TEST" = "403" ]; then
    print_error "❌ Root path is returning 403 Forbidden"
else
    print_warning "Root path returned: $ROOT_TEST"
fi

echo ""
print_header "4. Checking nginx logs..."
echo ""

# Check nginx logs
print_status "Recent nginx logs:"
docker-compose -f docker-compose.prod.yml logs --tail=10 nginx

echo ""
print_header "5. Testing local ACME challenge..."
echo ""

# Test locally
print_status "Testing ACME challenge locally:"
LOCAL_ACME=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/.well-known/acme-challenge/test)
print_status "Local ACME challenge returned: $LOCAL_ACME"

echo ""
print_header "6. Recommendations..."
echo ""

print_status "To fix the 403 error:"
echo ""
echo "1. 🔧 Fix Cloudflare settings:"
echo "   - Go to Cloudflare DNS settings"
echo "   - Make sure the orange cloud icon is GRAY (DNS only)"
echo "   - NOT orange (proxied)"
echo ""
echo "2. 🔄 Restart nginx with updated config:"
echo "   docker-compose -f docker-compose.prod.yml restart nginx"
echo ""
echo "3. 🔒 Retry SSL generation:"
echo "   docker-compose -f docker-compose.prod.yml run --rm certbot"
echo ""

if [ "$DNS_RESULT" != "$SERVER_IP" ]; then
    print_error "CRITICAL: DNS is not pointing to your server!"
    print_warning "Fix this first before trying SSL generation."
fi

if [ "$ACME_TEST" = "403" ]; then
    print_error "CRITICAL: ACME challenge path is blocked!"
    print_warning "This will prevent SSL certificate generation."
fi

echo ""
print_status "Current status:"
echo "  - HTTP site: http://$DOMAIN ✅"
echo "  - Services running: ✅"
echo "  - SSL certificate: ❌ (403 error)" 