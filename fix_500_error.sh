#!/bin/bash

echo "🔧 Fixing common 500 error causes..."

echo ""
echo "📋 1. Setting proper permissions..."
docker-compose -f docker-compose.prod.yml exec app chown -R www-data:www-data /var/www/html/storage
docker-compose -f docker-compose.prod.yml exec app chown -R www-data:www-data /var/www/html/bootstrap/cache
docker-compose -f docker-compose.prod.yml exec app chmod -R 775 /var/www/html/storage
docker-compose -f docker-compose.prod.yml exec app chmod -R 775 /var/www/html/bootstrap/cache

echo ""
echo "📋 2. Clearing all Laravel caches..."
docker-compose -f docker-compose.prod.yml exec app php artisan cache:clear
docker-compose -f docker-compose.prod.yml exec app php artisan config:clear
docker-compose -f docker-compose.prod.yml exec app php artisan route:clear
docker-compose -f docker-compose.prod.yml exec app php artisan view:clear

echo ""
echo "📋 3. Running database migrations..."
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

echo ""
echo "📋 4. Optimizing Laravel for production..."
docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
docker-compose -f docker-compose.prod.yml exec app php artisan route:cache
docker-compose -f docker-compose.prod.yml exec app php artisan view:cache

echo ""
echo "📋 5. Restarting containers..."
docker-compose -f docker-compose.prod.yml restart app
docker-compose -f docker-compose.prod.yml restart nginx

echo ""
echo "✅ Fix completed! Now run ./debug_500_error.sh to check if the issue is resolved." 