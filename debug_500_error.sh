#!/bin/bash

echo "🔍 Debugging 500 Internal Server Error..."

echo ""
echo "📋 1. Checking container status..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📋 2. Checking Laravel app logs..."
docker-compose -f docker-compose.prod.yml logs app --tail=50

echo ""
echo "📋 3. Checking Nginx logs..."
docker-compose -f docker-compose.prod.yml logs nginx --tail=20

echo ""
echo "📋 4. Checking if .env file is properly mounted and readable..."
docker-compose -f docker-compose.prod.yml exec app ls -la /var/www/html/.env

echo ""
echo "📋 5. Checking APP_KEY in container..."
docker-compose -f docker-compose.prod.yml exec app grep "APP_KEY=" /var/www/html/.env

echo ""
echo "📋 6. Testing Laravel configuration..."
docker-compose -f docker-compose.prod.yml exec app php artisan config:show --key=app.key

echo ""
echo "📋 7. Checking Laravel storage permissions..."
docker-compose -f docker-compose.prod.yml exec app ls -la /var/www/html/storage/

echo ""
echo "📋 8. Checking if Laravel can write to storage..."
docker-compose -f docker-compose.prod.yml exec app php artisan cache:clear
docker-compose -f docker-compose.prod.yml exec app php artisan config:clear

echo ""
echo "📋 9. Testing database connection..."
docker-compose -f docker-compose.prod.yml exec app php artisan tinker --execute="echo 'DB connection: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED');"

echo ""
echo "📋 10. Checking for any PHP errors..."
docker-compose -f docker-compose.prod.yml exec app php -l /var/www/html/public/index.php

echo ""
echo "🔍 Debug complete! Check the output above for any errors or issues." 