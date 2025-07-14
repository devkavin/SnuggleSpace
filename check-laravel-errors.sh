#!/bin/bash

echo "🔍 Diagnosing Laravel 500 Error"
echo "==============================="

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

print_header "1. Checking Laravel logs..."
echo ""

# Check Laravel logs
print_status "Recent Laravel error logs:"
docker-compose -f docker-compose.prod.yml exec app tail -20 /var/www/html/storage/logs/laravel.log 2>/dev/null || print_warning "No Laravel logs found"

echo ""
print_header "2. Checking PHP-FPM logs..."
echo ""

# Check PHP-FPM logs
print_status "PHP-FPM error logs:"
docker-compose -f docker-compose.prod.yml logs --tail=10 app

echo ""
print_header "3. Checking environment configuration..."
echo ""

# Check if .env exists and has required values
if [ -f ".env" ]; then
    print_status ".env file exists"
    
    # Check critical environment variables
    if grep -q "APP_KEY=" .env; then
        APP_KEY=$(grep "APP_KEY=" .env | cut -d'=' -f2)
        if [[ "$APP_KEY" == *"base64:"* ]]; then
            print_status "✅ APP_KEY is set"
        else
            print_warning "⚠️ APP_KEY might not be properly generated"
        fi
    else
        print_error "❌ APP_KEY is not set"
    fi
    
    if grep -q "DB_PASSWORD=" .env; then
        print_status "✅ DB_PASSWORD is set"
    else
        print_error "❌ DB_PASSWORD is not set"
    fi
    
    if grep -q "CERTBOT_EMAIL=" .env; then
        print_status "✅ CERTBOT_EMAIL is set"
    else
        print_error "❌ CERTBOT_EMAIL is not set"
    fi
else
    print_error "❌ .env file does not exist"
fi

echo ""
print_header "4. Checking database connection..."
echo ""

# Test database connection
print_status "Testing database connection:"
docker-compose -f docker-compose.prod.yml exec app php artisan tinker --execute="echo 'Database connection: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED');" 2>/dev/null || print_warning "Database connection test failed"

echo ""
print_header "5. Checking Laravel application..."
echo ""

# Check Laravel application status
print_status "Checking Laravel application:"
docker-compose -f docker-compose.prod.yml exec app php artisan --version 2>/dev/null || print_error "Laravel not working"

echo ""
print_header "6. Checking file permissions..."
echo ""

# Check file permissions
print_status "Checking storage and bootstrap/cache permissions:"
docker-compose -f docker-compose.prod.yml exec app ls -la /var/www/html/storage/logs/ 2>/dev/null || print_warning "Cannot check storage permissions"

echo ""
print_header "7. Common fixes to try..."
echo ""

print_status "Try these fixes in order:"
echo ""
echo "1. 🔑 Generate application key:"
echo "   docker-compose -f docker-compose.prod.yml exec app php artisan key:generate"
echo ""
echo "2. 🗄️ Run database migrations:"
echo "   docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force"
echo ""
echo "3. 🧹 Clear Laravel caches:"
echo "   docker-compose -f docker-compose.prod.yml exec app php artisan cache:clear"
echo "   docker-compose -f docker-compose.prod.yml exec app php artisan config:clear"
echo "   docker-compose -f docker-compose.prod.yml exec app php artisan route:clear"
echo ""
echo "4. 🔧 Fix file permissions:"
echo "   docker-compose -f docker-compose.prod.yml exec app chown -R www-data:www-data /var/www/html/storage"
echo "   docker-compose -f docker-compose.prod.yml exec app chown -R www-data:www-data /var/www/html/bootstrap/cache"
echo ""
echo "5. 🔄 Restart the application:"
echo "   docker-compose -f docker-compose.prod.yml restart app"
echo ""

print_status "After fixing Laravel, wait until 01:08:03 UTC to retry SSL generation." 