#!/bin/bash

echo "🔧 Fixing Git ownership issues..."

echo ""
echo "📋 1. Checking current ownership..."
ls -la /opt/snugglespace/.git

echo ""
echo "📋 2. Adding safe directory exception..."
git config --global --add safe.directory /opt/snugglespace

echo ""
echo "📋 3. Verifying the fix..."
git config --global --get-all safe.directory

echo ""
echo "📋 4. Testing git pull..."
git pull origin main

echo ""
echo "✅ Git ownership fix completed!"
echo "🎯 You should now be able to pull changes from GitHub." 