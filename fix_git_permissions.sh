#!/bin/bash

echo "🔧 Fixing Git permission issues..."

echo ""
echo "📋 1. Checking current user and ownership..."
whoami
ls -la /opt/snugglespace/.git

echo ""
echo "📋 2. Fixing ownership of the entire repository..."
sudo chown -R snugglespace:snugglespace /opt/snugglespace

echo ""
echo "📋 3. Setting proper permissions..."
chmod -R 755 /opt/snugglespace/.git

echo ""
echo "📋 4. Verifying the fix..."
ls -la /opt/snugglespace/.git

echo ""
echo "📋 5. Testing git pull..."
git pull origin main

echo ""
echo "✅ Git permission fix completed!"
echo "🎯 You should now be able to pull and push changes normally." 