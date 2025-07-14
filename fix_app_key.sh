#!/bin/bash

echo "🔧 Fixing APP_KEY in .env file..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Generate a new APP_KEY
echo "📝 Generating new APP_KEY..."
NEW_KEY=$(docker-compose -f docker-compose.prod.yml exec -T app php artisan key:generate --show --no-interaction 2>/dev/null)

if [ -z "$NEW_KEY" ]; then
    echo "❌ Failed to generate APP_KEY. Trying alternative method..."
    # Alternative: generate a base64 key manually
    NEW_KEY="base64:$(openssl rand -base64 32)"
fi

echo "🔑 Generated key: $NEW_KEY"

# Update the .env file
echo "📝 Updating .env file..."
sed -i "s/APP_KEY=.*/APP_KEY=$NEW_KEY/" .env

# Verify the change
if grep -q "APP_KEY=$NEW_KEY" .env; then
    echo "✅ APP_KEY updated successfully!"
else
    echo "❌ Failed to update APP_KEY in .env file"
    exit 1
fi

# Set proper permissions
echo "🔐 Setting proper permissions..."
chmod 644 .env
chown $(id -u):$(id -g) .env

# Restart the app container to pick up the new key
echo "🔄 Restarting app container..."
docker-compose -f docker-compose.prod.yml restart app

echo "✅ APP_KEY fix completed!"
echo "🔍 Current APP_KEY in .env:"
grep "APP_KEY=" .env 