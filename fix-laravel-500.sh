#!/bin/bash

echo "🔧 Fixing Laravel 500 Error"
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
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_header "1. Checking if .env file exists..."
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_status "Creating .env from template..."
    cp env.production.template .env
    print_warning "Please edit .env file with your settings before continuing."
    print_warning "Run: nano .env"
    exit 1
else
    print_status ".env file exists"
fi

print_header "2. Generating application key..."
docker-compose -f docker-compose.prod.yml exec app php artisan key:generate --no-interaction

print_header "3. Running database migrations..."
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

print_header "4. Clearing Laravel caches..."
docker-compose -f docker-compose.prod.yml exec app php artisan cache:clear
docker-compose -f docker-compose.prod.yml exec app php artisan config:clear
docker-compose -f docker-compose.prod.yml exec app php artisan route:clear
docker-compose -f docker-compose.prod.yml exec app php artisan view:clear

print_header "5. Fixing file permissions..."
docker-compose -f docker-compose.prod.yml exec app chown -R www-data:www-data /var/www/html/storage
docker-compose -f docker-compose.prod.yml exec app chown -R www-data:www-data /var/www/html/bootstrap/cache
docker-compose -f docker-compose.prod.yml exec app chmod -R 755 /var/www/html/storage
docker-compose -f docker-compose.prod.yml exec app chmod -R 755 /var/www/html/bootstrap/cache

print_header "6. Restarting application..."
docker-compose -f docker-compose.prod.yml restart app

print_status "Waiting for application to restart..."
sleep 10

print_header "7. Testing application..."
# Test if the application is working
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|302"; then
    print_status "✅ Application is working!"
else
    print_warning "⚠️ Application might still have issues"
    print_status "Check the logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=10 app
fi

print_header "8. Testing domain access..."
DOMAIN="snugglespace.devkavin.com"
DOMAIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN)

if [ "$DOMAIN_TEST" = "200" ] || [ "$DOMAIN_TEST" = "302" ]; then
    print_status "✅ Domain is accessible!"
    print_status "Your site is working at: http://$DOMAIN"
else
    print_warning "Domain returned: $DOMAIN_TEST"
fi

echo ""
print_status "Laravel fixes completed!"
print_status ""
print_status "Next steps:"
print_status "1. Wait until 01:08:03 UTC for Let's Encrypt rate limit to reset"
print_status "2. Then run: docker-compose -f docker-compose.prod.yml run --rm certbot"
print_status "3. Your site should then be accessible via HTTPS" 