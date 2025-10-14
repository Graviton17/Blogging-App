#!/bin/bash

# XAMPP Setup Script for Blogging App
# This script helps set up the Blogging App with XAMPP

echo "🚀 XAMPP Blogging App Setup Script"
echo "=================================="

# Check if XAMPP is installed
if [ ! -d "/opt/lampp" ]; then
    echo "❌ XAMPP not found. Please install XAMPP first:"
    echo "   Download from: https://www.apachefriends.org/index.html"
    exit 1
fi

# Get the project directory
PROJECT_DIR="/home/krish-kalola/VS Code/College/Web Devlopment/Blogging-App"
XAMPP_HTDOCS="/opt/lampp/htdocs"
PROJECT_NAME="blogging-app"

echo "📁 Project Directory: $PROJECT_DIR"
echo "🌐 XAMPP htdocs: $XAMPP_HTDOCS"

# Check if project exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    exit 1
fi

# Create symlink or copy project to XAMPP htdocs
echo "📋 Setting up project in XAMPP..."

if [ -L "$XAMPP_HTDOCS/$PROJECT_NAME" ] || [ -d "$XAMPP_HTDOCS/$PROJECT_NAME" ]; then
    echo "⚠️  Project already exists in XAMPP htdocs. Removing old version..."
    sudo rm -rf "$XAMPP_HTDOCS/$PROJECT_NAME"
fi

# Create symlink (recommended)
sudo ln -s "$PROJECT_DIR" "$XAMPP_HTDOCS/$PROJECT_NAME"

echo "✅ Project linked to XAMPP htdocs successfully!"

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chmod -R 755 "$PROJECT_DIR"
sudo chown -R www-data:www-data "$PROJECT_DIR/uploads" 2>/dev/null || true

# Start XAMPP services
echo "🔄 Starting XAMPP services..."
sudo /opt/lampp/lampp start

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost/blogging-app/Frontend/home/home.html"
echo "   API Test: http://localhost/blogging-app/Backend/api/test.php"
echo "   phpMyAdmin: http://localhost/phpmyadmin"
echo ""
echo "📋 Next steps:"
echo "   1. Import database: database/blog_app.sql into phpMyAdmin"
echo "   2. Update database config if needed: config/database.php"
echo "   3. Test the API endpoints"
echo ""