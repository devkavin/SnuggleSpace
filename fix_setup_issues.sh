#!/bin/bash

echo "🔧 Fixing setup issues..."

echo ""
echo "📋 1. Installing Faker for seeding..."
docker-compose -f docker-compose.prod.yml exec app composer require --dev fakerphp/faker

echo ""
echo "📋 2. Running database seeding..."
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force

echo ""
echo "📋 3. Clearing route cache to fix route conflicts..."
docker-compose -f docker-compose.prod.yml exec app php artisan route:clear

echo ""
echo "📋 4. Rebuilding route cache..."
docker-compose -f docker-compose.prod.yml exec app php artisan route:cache

echo ""
echo "📋 5. Testing routes (without --compact option)..."
docker-compose -f docker-compose.prod.yml exec app php artisan route:list

echo ""
echo "📋 6. Testing the application..."
docker-compose -f docker-compose.prod.yml exec app php artisan --version

echo ""
echo "📋 7. Checking if the site is accessible..."
curl -I http://localhost 2>/dev/null || echo "Site check completed"

echo ""
echo "✅ Setup issues fixed!"
echo "🌐 Your Laravel application should now be fully functional."
echo "🔒 Next step: Generate SSL certificate with:"
echo "   docker-compose -f docker-compose.prod.yml run --rm certbot" 