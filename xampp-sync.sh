#!/bin/bash

# XAMPP Sync Script for Blogging App
# This script syncs your development files with the XAMPP htdocs directory

echo "🔄 Syncing Blogging App with XAMPP..."

PROJECT_DIR="/home/krish-kalola/VS Code/College/Web Devlopment/Blogging-App"
XAMPP_DIR="/opt/lampp/htdocs/blogging-app"

# Check if source directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Source directory not found: $PROJECT_DIR"
    exit 1
fi

# Check if XAMPP directory exists
if [ ! -d "$XAMPP_DIR" ]; then
    echo "❌ XAMPP directory not found: $XAMPP_DIR"
    echo "Run the xampp-setup.sh script first!"
    exit 1
fi

echo "📂 Source: $PROJECT_DIR"
echo "📂 Target: $XAMPP_DIR"

# Sync Frontend files
echo "🔄 Syncing Frontend files..."
sudo rsync -av --delete "$PROJECT_DIR/Frontend/" "$XAMPP_DIR/Frontend/"

# Sync Backend files
echo "🔄 Syncing Backend files..."
sudo rsync -av --delete "$PROJECT_DIR/Backend/" "$XAMPP_DIR/Backend/"

# Sync config files
echo "🔄 Syncing config files..."
sudo rsync -av --delete "$PROJECT_DIR/config/" "$XAMPP_DIR/config/"

# Sync other important files
echo "🔄 Syncing other files..."
sudo cp "$PROJECT_DIR/.htaccess" "$XAMPP_DIR/" 2>/dev/null || true
sudo cp "$PROJECT_DIR/index-xampp.html" "$XAMPP_DIR/" 2>/dev/null || true
sudo cp "$PROJECT_DIR/xampp-test.html" "$XAMPP_DIR/" 2>/dev/null || true

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data "$XAMPP_DIR"
sudo chmod -R 755 "$XAMPP_DIR"

# Ensure uploads directory is writable
sudo chmod -R 777 "$XAMPP_DIR/uploads" 2>/dev/null || true

echo "✅ Sync complete!"
echo ""
echo "🌐 Your application is now updated at:"
echo "   http://localhost/blogging-app/"
echo ""