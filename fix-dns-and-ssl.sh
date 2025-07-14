#!/bin/bash

echo "🔧 Fixing DNS and SSL Issues"
echo "============================"

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

DOMAIN="snugglespace.devkavin.com"

print_header "1. Getting your server's IPv6 address..."
SERVER_IPV6=$(curl -s ifconfig.me)
print_status "Your server's IPv6: $SERVER_IPV6"

print_header "2. Checking current DNS resolution..."
if command -v nslookup >/dev/null 2>&1; then
    DNS_RESULT=$(nslookup $DOMAIN 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    print_status "Current DNS resolves to: $DNS_RESULT"
    
    if [ "$DNS_RESULT" = "$SERVER_IPV6" ]; then
        print_status "✅ DNS is correctly configured!"
    else
        print_error "❌ DNS is NOT correctly configured!"
        print_warning "You need to update Cloudflare DNS:"
        print_warning "  - Go to Cloudflare DNS settings"
        print_warning "  - Find AAAA record for $DOMAIN"
        print_warning "  - Change IPv6 from: $DNS_RESULT"
        print_warning "  - To your server IPv6: $SERVER_IPV6"
        print_warning "  - Make sure cloud icon is GRAY (DNS only)"
        echo ""
        read -p "Press Enter after you've updated the DNS in Cloudflare..."
    fi
else
    print_warning "nslookup not available"
fi

print_header "3. Restarting nginx with updated config..."
docker-compose -f docker-compose.prod.yml restart nginx

print_status "Waiting for nginx to restart..."
sleep 5

print_header "4. Testing ACME challenge path..."
ACME_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/.well-known/acme-challenge/test)
print_status "Local ACME challenge returned: $ACME_TEST"

if [ "$ACME_TEST" = "404" ]; then
    print_status "✅ ACME challenge path is working locally (404 is expected)"
else
    print_warning "ACME challenge path returned: $ACME_TEST"
fi

print_header "5. Testing domain access..."
DOMAIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/.well-known/acme-challenge/test)
print_status "Domain ACME challenge returned: $DOMAIN_TEST"

if [ "$DOMAIN_TEST" = "404" ]; then
    print_status "✅ Domain ACME challenge is working!"
    
    print_header "6. Generating SSL certificate..."
    docker-compose -f docker-compose.prod.yml run --rm certbot
    
    if [ $? -eq 0 ]; then
        print_status "✅ SSL certificate generated successfully!"
        print_status "Your site should now be accessible at: https://$DOMAIN"
    else
        print_error "❌ SSL certificate generation failed"
        print_warning "Check the logs above for specific errors"
    fi
else
    print_error "❌ Domain ACME challenge still not working"
    print_warning "This might be due to:"
    print_warning "  1. DNS not updated yet (can take a few minutes)"
    print_warning "  2. Cloudflare proxy still enabled"
    print_warning "  3. Hetzner firewall blocking port 80"
fi

print_header "7. Final status check..."
docker-compose -f docker-compose.prod.yml ps

echo ""
print_status "If SSL generation failed, you can still access your site via HTTP:"
echo "http://$DOMAIN" 