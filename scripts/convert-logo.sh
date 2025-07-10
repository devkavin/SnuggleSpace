#!/bin/bash

# Script to convert SnuggleSpace logo from SVG to PNG
# Requires ImageMagick or rsvg-convert

echo "🎨 Converting SnuggleSpace logo from SVG to PNG..."

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    convert docs/screenshots/logo.svg -resize 200x200 docs/screenshots/logo.png
    echo "✅ Logo converted successfully!"
elif command -v rsvg-convert &> /dev/null; then
    echo "Using rsvg-convert..."
    rsvg-convert -w 200 -h 200 docs/screenshots/logo.svg -o docs/screenshots/logo.png
    echo "✅ Logo converted successfully!"
else
    echo "❌ Neither ImageMagick nor rsvg-convert found."
    echo "Please install one of them:"
    echo "  - ImageMagick: sudo apt-get install imagemagick"
    echo "  - rsvg-convert: sudo apt-get install librsvg2-bin"
    echo ""
    echo "Or manually convert docs/screenshots/logo.svg to docs/screenshots/logo.png"
fi 