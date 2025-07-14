#!/bin/bash

echo "🚀 Deploying fixed .env file to server..."

# Check if we're in the right directory
if [ ! -f .env ]; then
    echo "❌ .env file not found in current directory!"
    exit 1
fi

# Check if the APP_KEY is properly set
if grep -q "APP_KEY=base64:YOUR_APP_KEY_HERE" .env; then
    echo "❌ APP_KEY is still the placeholder! Run ./fix_app_key.sh first."
    exit 1
fi

echo "✅ APP_KEY looks good in local .env file"

# Instructions for server deployment
echo ""
echo "📋 Next steps to deploy to your server:"
echo ""
echo "1. Push the updated .env file to GitHub:"
echo "   git add .env"
echo "   git commit -m 'Fix APP_KEY for production'"
echo "   git push origin main"
echo ""
echo "2. SSH into your server and pull the changes:"
echo "   ssh root@your-server-ip"
echo "   cd /path/to/SnuggleSpace"
echo "   git pull origin main"
echo ""
echo "3. Restart the containers on the server:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "4. Check if Laravel is working:"
echo "   docker-compose -f docker-compose.prod.yml logs app"
echo ""
echo "5. Once Laravel is working, generate SSL certificate:"
echo "   docker-compose -f docker-compose.prod.yml run --rm certbot"
echo ""

echo "🎯 The 500 error should be resolved once you deploy this to the server!" 