#!/bin/bash

echo "🚀 Completing Laravel setup..."

echo ""
echo "📋 1. Running database migrations..."
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

echo ""
echo "📋 2. Seeding database (if needed)..."
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force

echo ""
echo "📋 3. Optimizing Laravel for production..."
docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
docker-compose -f docker-compose.prod.yml exec app php artisan route:cache
docker-compose -f docker-compose.prod.yml exec app php artisan view:cache

echo ""
echo "📋 4. Setting final permissions..."
docker-compose -f docker-compose.prod.yml exec app chown -R www-data:www-data /var/www/html
docker-compose -f docker-compose.prod.yml exec app chmod -R 755 /var/www/html/storage
docker-compose -f docker-compose.prod.yml exec app chmod -R 755 /var/www/html/bootstrap/cache

echo ""
echo "📋 5. Testing the application..."
docker-compose -f docker-compose.prod.yml exec app php artisan route:list --compact

echo ""
echo "✅ Setup completed! Your Laravel application should now be fully functional."
echo "🌐 Visit: http://snugglespace.devkavin.com"
echo ""
echo "🔒 Next step: Generate SSL certificate with:"
echo "   docker-compose -f docker-compose.prod.yml run --rm certbot" 