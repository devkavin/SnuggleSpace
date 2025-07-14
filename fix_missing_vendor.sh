#!/bin/bash

echo "🔧 Fixing missing vendor directory..."

echo ""
echo "📋 1. Checking if vendor directory exists..."
docker-compose -f docker-compose.prod.yml exec app ls -la /var/www/html/vendor

echo ""
echo "📋 2. Installing Composer dependencies..."
docker-compose -f docker-compose.prod.yml exec app composer install --optimize-autoloader --no-dev --no-interaction

echo ""
echo "📋 3. Verifying vendor/autoload.php exists..."
docker-compose -f docker-compose.prod.yml exec app ls -la /var/www/html/vendor/autoload.php

echo ""
echo "📋 4. Setting proper permissions..."
docker-compose -f docker-compose.prod.yml exec app chown -R www-data:www-data /var/www/html/vendor
docker-compose -f docker-compose.prod.yml exec app chmod -R 755 /var/www/html/vendor

echo ""
echo "📋 5. Clearing Laravel caches..."
docker-compose -f docker-compose.prod.yml exec app php artisan cache:clear
docker-compose -f docker-compose.prod.yml exec app php artisan config:clear

echo ""
echo "📋 6. Testing if Laravel can load..."
docker-compose -f docker-compose.prod.yml exec app php artisan --version

echo ""
echo "✅ Vendor fix completed! The 500 error should now be resolved."
echo "🌐 Try accessing your site again: http://snugglespace.devkavin.com" 