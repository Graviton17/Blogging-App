# Blogging App - Complete Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Security Features](#security-features)
8. [Installation Guide](#installation-guide)
9. [Configuration](#configuration)
10. [Frontend Pages](#frontend-pages)
11. [Backend Structure](#backend-structure)
12. [Development Workflow](#development-workflow)
13. [Testing](#testing)
14. [Deployment](#deployment)
15. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Blogging App** is a modern, full-featured blogging platform built with vanilla PHP and JavaScript. It provides a complete content management system with user authentication, post creation, comments, likes, and comprehensive admin features.

### **Project Metadata**

- **Name**: Blogging App
- **Version**: 1.0.0
- **Technology Stack**: PHP 7.4+, MySQL 5.7+, HTML5, CSS3, JavaScript (ES6+)
- **Architecture**: REST API with MVC pattern
- **Repository**: Graviton17/Blogging-App
- **License**: MIT

### **Target Audience**

- Individual bloggers
- Content creators
- Educational institutions
- Small to medium-sized publishing platforms

---

## ✨ Key Features

### **1. User Management**

#### **Authentication & Authorization**

- ✅ User registration with email verification
- ✅ Secure login with password hashing (bcrypt)
- ✅ "Remember Me" functionality with secure tokens
- ✅ Password reset via email
- ✅ Session management with automatic timeout
- ✅ Role-based access control (Admin, Author, Reader)

#### **Profile Management**

- ✅ User profile customization
- ✅ Avatar upload and management
- ✅ Bio and social media links
- ✅ Privacy settings
- ✅ Email and notification preferences

### **2. Content Management**

#### **Post Creation & Editing**

- ✅ Rich text editor with formatting options
- ✅ Draft, Published, Private, and Scheduled statuses
- ✅ Featured image support
- ✅ Category and tag assignment
- ✅ SEO metadata (meta title, description)
- ✅ Allow/disable comments per post
- ✅ Post excerpt generation
- ✅ Auto-save functionality

#### **Post Features**

- ✅ View count tracking
- ✅ Like/Unlike functionality
- ✅ Share on social media (Twitter, Facebook, LinkedIn, WhatsApp, Telegram)
- ✅ Reading time estimation
- ✅ Related posts suggestions
- ✅ Author information display

### **3. Comments System**

- ✅ Nested comments (replies)
- ✅ Comment moderation for admins/authors
- ✅ Like/Unlike comments
- ✅ Edit and delete own comments
- ✅ Real-time comment validation
- ✅ Rate limiting to prevent spam
- ✅ Report inappropriate comments

### **4. Search & Discovery**

- ✅ Full-text search across posts
- ✅ Filter by category
- ✅ Filter by author
- ✅ Filter by tags
- ✅ Sort by date, popularity, views
- ✅ Pagination with customizable page size

### **5. Categories & Tags**

- ✅ Hierarchical category system
- ✅ Dynamic tag creation
- ✅ Category-based post listing
- ✅ Tag cloud visualization
- ✅ Post count per category/tag

### **6. User Dashboard**

#### **Author Features**

- ✅ View all own posts
- ✅ Post statistics (views, likes, comments)
- ✅ Quick edit/delete posts
- ✅ Draft management
- ✅ Comment moderation on own posts

#### **Reader Features**

- ✅ View liked posts
- ✅ Comment history
- ✅ Reading list
- ✅ Activity timeline

### **7. Settings & Preferences**

#### **Account Settings**

- ✅ Update profile information
- ✅ Change email address
- ✅ Update password
- ✅ Delete account

#### **Notification Settings**

- ✅ Email notifications for comments
- ✅ Email notifications for likes
- ✅ Marketing email preferences
- ✅ Comment notification preferences

#### **Privacy Settings**

- ✅ Profile visibility toggle
- ✅ Email visibility
- ✅ Allow comments on posts
- ✅ Activity visibility

### **8. Static Pages**

- ✅ Home page with hero section
- ✅ About page with team information
- ✅ Contact page with form
- ✅ User-friendly navigation
- ✅ Responsive design

---

## 🏗️ Technical Architecture

### **Architecture Pattern**

The application follows a **3-tier MVC (Model-View-Controller)** architecture:

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                 │
│  (Frontend - HTML, CSS, JavaScript)             │
│  - Home, Login, Sign-up, Create Post, etc.      │
└─────────────────┬───────────────────────────────┘
                  │ HTTP/AJAX Requests
┌─────────────────▼───────────────────────────────┐
│              Application Layer                   │
│  (Backend API - PHP)                            │
│  - Routes, Controllers, Business Logic          │
│  - Authentication, Authorization                │
│  - Data Validation, CSRF Protection             │
└─────────────────┬───────────────────────────────┘
                  │ SQL Queries
┌─────────────────▼───────────────────────────────┐
│              Data Layer                         │
│  (Database - MySQL)                             │
│  - Users, Posts, Comments, Categories, etc.     │
└─────────────────────────────────────────────────┘
```

### **Technology Stack**

#### **Frontend**

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties, flexbox, grid
- **JavaScript ES6+**: Vanilla JS for interactivity
- **Font Awesome**: Icon library
- **Google Fonts**: Typography (Inter)

#### **Backend**

- **PHP 7.4+**: Server-side logic
- **MySQL 5.7+**: Relational database
- **PDO**: Database abstraction layer
- **Sessions**: User state management

#### **Development Tools**

- **XAMPP**: Local development environment
- **Git**: Version control
- **VS Code**: Code editor

### **Project Structure**

```
Blogging-App/
├── Backend/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── posts/         # Post management endpoints
│   │   ├── comments/      # Comment endpoints
│   │   └── users/         # User management endpoints
│   ├── models/            # Data models (User, Post, Comment, etc.)
│   ├── utils/             # Utility classes (Security)
│   ├── includes/          # Bootstrap and configuration
│   ├── cors.php           # CORS configuration
│   └── routes.php         # API routing
├── Frontend/
│   ├── home/              # Landing page
│   ├── login/             # Login page
│   ├── sign-up/           # Registration page
│   ├── create-post/       # Post creation/editing
│   ├── post-detail/       # Single post view
│   ├── profile/           # User profile
│   ├── settings/          # User settings
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   └── assets/            # CSS, JS, images
├── config/
│   ├── app.php            # Application configuration
│   └── database.php       # Database configuration
├── database/
│   ├── blog_app.sql       # Complete database schema
│   ├── migrations/        # Database migration files
│   └── seeds/             # Sample data
├── uploads/               # User-uploaded files
│   ├── avatars/
│   ├── posts/
│   └── temp/
├── logs/                  # Application logs
└── docs/                  # Documentation
```

---

## 🗄️ Database Schema

### **Entity Relationship Diagram**

```
┌─────────────┐         ┌──────────────┐         ┌────────────┐
│    Users    │─────────│    Posts     │─────────│ Categories │
└──────┬──────┘    1:N  └──────┬───────┘    N:M  └────────────┘
       │                        │                         │
       │ 1:1                    │ 1:N                     │
       │                        │                         │
┌──────▼──────┐         ┌──────▼───────┐         ┌──────▼──────┐
│  Profiles   │         │   Comments   │         │Post_Categories│
└─────────────┘         └──────┬───────┘         └─────────────┘
                               │
                               │ 1:N
                               │
                        ┌──────▼───────┐
                        │    Likes     │
                        └──────────────┘
```

### **Core Tables**

#### **1. Users Table**

```sql
users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role ENUM('admin', 'author', 'reader') DEFAULT 'reader',
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

**Purpose**: Store user authentication and basic profile information.

#### **2. Profiles Table**

```sql
profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    avatar VARCHAR(255),
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    twitter VARCHAR(100),
    facebook VARCHAR(100),
    instagram VARCHAR(100),
    linkedin VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

**Purpose**: Extended user profile information and social media links.

#### **3. Posts Table**

```sql
posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(255),
    status ENUM('draft', 'published', 'private', 'scheduled') DEFAULT 'draft',
    scheduled_at DATETIME,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    allow_comments BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
)
```

**Purpose**: Store blog posts with metadata and status tracking.

#### **4. Categories Table**

```sql
categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
)
```

**Purpose**: Organize posts into hierarchical categories.

#### **5. Tags Table**

```sql
tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Purpose**: Enable tag-based post classification.

#### **6. Comments Table**

```sql
comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT,
    content TEXT NOT NULL,
    status ENUM('pending', 'approved', 'spam', 'trash') DEFAULT 'approved',
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
)
```

**Purpose**: Store post comments with threading support.

#### **7. Likes Table**

```sql
likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT,
    comment_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (user_id, post_id, comment_id)
)
```

**Purpose**: Track likes on posts and comments.

#### **8. Sessions Table**

```sql
sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

**Purpose**: Manage user sessions and activity tracking.

#### **9. Remember Tokens Table**

```sql
remember_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

**Purpose**: Handle "Remember Me" functionality securely.

#### **10. Junction Tables**

**post_categories**

```sql
post_categories (
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
)
```

**post_tags**

```sql
post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
)
```

---

## 🔌 API Documentation

### **Base URL**

```
http://localhost/blogging-app/Backend/api
```

### **Authentication Endpoints**

#### **1. Register User**

```http
POST /auth/register.php
Content-Type: application/json

Request Body:
{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "csrf_token": "token_value"
}

Response (201 Created):
{
    "success": true,
    "message": "Registration successful",
    "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com"
    }
}
```

#### **2. Login**

```http
POST /auth/login.php
Content-Type: application/json

Request Body:
{
    "username": "johndoe",
    "password": "SecurePass123!",
    "remember_me": true,
    "csrf_token": "token_value"
}

Response (200 OK):
{
    "success": true,
    "message": "Login successful",
    "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "role": "author"
    }
}
```

#### **3. Logout**

```http
POST /auth/logout.php

Response (200 OK):
{
    "success": true,
    "message": "Logged out successfully"
}
```

#### **4. Check Authentication Status**

```http
GET /auth/status.php

Response (200 OK):
{
    "success": true,
    "authenticated": true,
    "user": {
        "id": 1,
        "username": "johndoe",
        "role": "author"
    }
}
```

#### **5. Get CSRF Token**

```http
GET /auth/csrf-token.php

Response (200 OK):
{
    "success": true,
    "csrf_token": "random_secure_token"
}
```

### **Post Endpoints**

#### **1. Create Post**

```http
POST /posts/create-flexible.php
Content-Type: application/json

Request Body:
{
    "title": "My First Blog Post",
    "content": "<p>This is the content...</p>",
    "excerpt": "A brief summary",
    "status": "published",
    "categories": [1, 2],
    "tags": ["technology", "tutorial"],
    "allow_comments": true,
    "meta_title": "SEO Title",
    "meta_description": "SEO Description",
    "csrf_token": "token_value"
}

Response (201 Created):
{
    "success": true,
    "status": "success",
    "message": "Post created successfully",
    "post": {
        "id": 1,
        "title": "My First Blog Post",
        "slug": "my-first-blog-post",
        "author_id": 1,
        "status": "published",
        "created_at": "2025-10-15 10:30:00"
    }
}
```

#### **2. Get Posts List**

```http
GET /posts/list.php?page=1&limit=12&category=technology&sort=created_at&order=DESC

Response (200 OK):
{
    "success": true,
    "posts": [
        {
            "id": 1,
            "title": "Post Title",
            "excerpt": "Brief summary...",
            "author": {
                "id": 1,
                "username": "johndoe",
                "avatar": "avatar.jpg"
            },
            "categories": ["Technology", "Tutorial"],
            "tags": ["php", "mysql"],
            "view_count": 150,
            "like_count": 25,
            "comment_count": 10,
            "created_at": "2025-10-15 10:30:00"
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 5,
        "total_posts": 60,
        "per_page": 12
    }
}
```

#### **3. Get Single Post**

```http
GET /posts/get.php?id=1

Response (200 OK):
{
    "success": true,
    "post": {
        "id": 1,
        "title": "Post Title",
        "slug": "post-title",
        "content": "<p>Full content here...</p>",
        "excerpt": "Brief summary",
        "featured_image": "image.jpg",
        "author": {
            "id": 1,
            "username": "johndoe",
            "full_name": "John Doe",
            "avatar": "avatar.jpg",
            "bio": "Author bio"
        },
        "categories": [...],
        "tags": [...],
        "view_count": 150,
        "like_count": 25,
        "comment_count": 10,
        "user_has_liked": false,
        "created_at": "2025-10-15 10:30:00",
        "updated_at": "2025-10-15 11:00:00"
    }
}
```

#### **4. Update Post**

```http
PUT /posts/update.php
Content-Type: application/json

Request Body:
{
    "id": 1,
    "title": "Updated Title",
    "content": "<p>Updated content...</p>",
    "status": "published",
    "csrf_token": "token_value"
}

Response (200 OK):
{
    "success": true,
    "message": "Post updated successfully",
    "post": {...}
}
```

#### **5. Delete Post**

```http
DELETE /posts/delete.php
Content-Type: application/json

Request Body:
{
    "id": 1,
    "csrf_token": "token_value"
}

Response (200 OK):
{
    "success": true,
    "message": "Post deleted successfully"
}
```

#### **6. Like/Unlike Post**

```http
POST /posts/like.php
Content-Type: application/json

Request Body:
{
    "post_id": 1,
    "csrf_token": "token_value"
}

Response (200 OK):
{
    "success": true,
    "liked": true,
    "like_count": 26
}
```

#### **7. Get Categories**

```http
GET /posts/categories.php

Response (200 OK):
{
    "success": true,
    "categories": [
        {
            "id": 1,
            "name": "Technology",
            "slug": "technology",
            "description": "Tech posts",
            "post_count": 25
        }
    ]
}
```

### **Comment Endpoints**

#### **1. Create Comment**

```http
POST /comments/create.php
Content-Type: application/json

Request Body:
{
    "post_id": 1,
    "content": "Great article!",
    "parent_id": null,
    "csrf_token": "token_value"
}

Response (201 Created):
{
    "success": true,
    "message": "Comment posted successfully",
    "comment": {
        "id": 1,
        "content": "Great article!",
        "user": {...},
        "created_at": "2025-10-15 12:00:00"
    }
}
```

#### **2. Get Comments for Post**

```http
GET /comments/list.php?post_id=1

Response (200 OK):
{
    "success": true,
    "comments": [
        {
            "id": 1,
            "content": "Comment text",
            "user": {
                "id": 2,
                "username": "janedoe",
                "avatar": "avatar.jpg"
            },
            "parent_id": null,
            "like_count": 5,
            "replies": [...],
            "created_at": "2025-10-15 12:00:00"
        }
    ],
    "total": 10
}
```

#### **3. Update Comment**

```http
PUT /comments/update.php
Content-Type: application/json

Request Body:
{
    "id": 1,
    "content": "Updated comment text",
    "csrf_token": "token_value"
}

Response (200 OK):
{
    "success": true,
    "message": "Comment updated successfully"
}
```

#### **4. Delete Comment**

```http
DELETE /comments/delete.php
Content-Type: application/json

Request Body:
{
    "id": 1,
    "csrf_token": "token_value"
}

Response (200 OK):
{
    "success": true,
    "message": "Comment deleted successfully"
}
```

#### **5. Moderate Comment (Admin/Author only)**

```http
POST /comments/moderate.php
Content-Type: application/json

Request Body:
{
    "id": 1,
    "status": "approved",
    "csrf_token": "token_value"
}

Response (200 OK):
{
    "success": true,
    "message": "Comment status updated"
}
```

### **Error Responses**

All endpoints follow a consistent error format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or missing parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `405 Method Not Allowed`: Wrong HTTP method
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

---

## 👥 User Roles & Permissions

### **1. Reader (Default)**

**Capabilities:**

- ✅ View published posts
- ✅ Search and filter content
- ✅ Like posts
- ✅ Comment on posts (if enabled)
- ✅ Edit/delete own comments
- ✅ Update own profile
- ❌ Create posts
- ❌ Moderate comments
- ❌ Access admin features

### **2. Author**

**Inherits all Reader capabilities, plus:**

- ✅ Create, edit, and delete own posts
- ✅ Save drafts
- ✅ Schedule posts for future publishing
- ✅ Upload featured images
- ✅ Manage categories and tags on own posts
- ✅ Moderate comments on own posts
- ✅ View post analytics (views, likes, comments)
- ❌ Edit other users' posts
- ❌ Access global admin features

### **3. Admin**

**Inherits all Author capabilities, plus:**

- ✅ Manage all users (create, edit, delete, change roles)
- ✅ Edit and delete any post
- ✅ Moderate all comments across the site
- ✅ Manage categories and tags globally
- ✅ View site-wide analytics
- ✅ Access system logs
- ✅ Configure site settings
- ✅ Bulk operations on content

### **Permission Matrix**

| Feature               | Reader | Author | Admin |
| --------------------- | :----: | :----: | :---: |
| View published posts  |   ✅   |   ✅   |  ✅   |
| Like posts            |   ✅   |   ✅   |  ✅   |
| Comment on posts      |   ✅   |   ✅   |  ✅   |
| Create posts          |   ❌   |   ✅   |  ✅   |
| Edit own posts        |   ❌   |   ✅   |  ✅   |
| Delete own posts      |   ❌   |   ✅   |  ✅   |
| Edit any post         |   ❌   |   ❌   |  ✅   |
| Delete any post       |   ❌   |   ❌   |  ✅   |
| Moderate own comments |   ❌   |   ✅   |  ✅   |
| Moderate all comments |   ❌   |   ❌   |  ✅   |
| Manage users          |   ❌   |   ❌   |  ✅   |
| Site configuration    |   ❌   |   ❌   |  ✅   |

---

## 🔒 Security Features

### **1. Authentication Security**

#### **Password Hashing**

- Uses `bcrypt` algorithm with cost factor of 12
- Passwords never stored in plain text
- Automatic password strength validation (min 8 characters)

#### **Session Management**

- Secure session cookies with `httpOnly` and `sameSite` flags
- Session timeout after 24 hours of inactivity
- Session regeneration on authentication state changes
- IP address and user agent tracking

#### **Remember Me Tokens**

- Cryptographically secure random tokens (256-bit)
- Token expiration after 30 days
- One-time use tokens (regenerated on each login)
- Secure token storage with hashing

### **2. CSRF Protection**

- CSRF tokens required for all state-changing operations
- Tokens expire after 1 hour
- Token validation on server-side for all POST/PUT/DELETE requests
- Double-submit cookie pattern

### **3. XSS Prevention**

- Input sanitization using `htmlspecialchars()`
- Content Security Policy (CSP) headers
- Output encoding for user-generated content
- HTML purification for rich text content

### **4. SQL Injection Prevention**

- Prepared statements with PDO
- Parameter binding for all database queries
- No raw SQL string concatenation
- Input validation and type casting

### **5. Rate Limiting**

- API rate limits: 100 requests per minute
- Login attempts: Max 5 failed attempts, 15-minute lockout
- Comment posting: Max 10 comments per minute
- IP-based and user-based throttling

### **6. File Upload Security**

- File type validation (whitelist approach)
- File size limits (5MB for images)
- Secure filename generation
- Storage outside web root when possible
- Virus scanning integration ready

### **7. Additional Security Measures**

- ✅ HTTPS enforcement (production)
- ✅ Secure HTTP headers (X-Frame-Options, X-Content-Type-Options)
- ✅ CORS configuration for API endpoints
- ✅ Error message sanitization (no sensitive info leak)
- ✅ Logging of security events
- ✅ Regular dependency updates
- ✅ Input validation on both client and server
- ✅ Protection against timing attacks

---

## 📦 Installation Guide

### **Prerequisites**

1. **XAMPP** (v8.0+ recommended)

   - Apache 2.4+
   - PHP 7.4+
   - MySQL 5.7+
   - phpMyAdmin

2. **Git** (for cloning repository)

3. **Modern Web Browser**
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+

### **Step 1: Clone Repository**

```bash
cd /opt/lampp/htdocs  # Linux/Mac
# OR
cd C:\xampp\htdocs    # Windows

git clone https://github.com/Graviton17/Blogging-App.git
cd Blogging-App
```

### **Step 2: Database Setup**

1. Start XAMPP services:

```bash
sudo /opt/lampp/lampp start  # Linux/Mac
# OR use XAMPP Control Panel on Windows
```

2. Open phpMyAdmin: `http://localhost/phpmyadmin`

3. Create database:

   - Click "New" in the left sidebar
   - Database name: `blog_app`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

4. Import schema:

   - Select `blog_app` database
   - Click "Import" tab
   - Choose file: `database/blog_app.sql`
   - Click "Go"

5. (Optional) Import sample data:
   - Import file: `database/seeds/sample_data.sql`

### **Step 3: Configuration**

1. **Database Configuration**

Edit `config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'blog_app');
define('DB_USER', 'root');
define('DB_PASS', '');  // Your MySQL password
define('DB_CHARSET', 'utf8mb4');
```

2. **Application Configuration**

Edit `config/app.php`:

```php
define('APP_ENV', 'development');
define('APP_URL', 'http://localhost/Blogging-App/Frontend');
define('API_URL', 'http://localhost/Blogging-App/Backend/api');
```

3. **Create Required Directories**

```bash
mkdir -p uploads/{avatars,posts,temp}
mkdir -p logs
chmod 777 uploads logs  # Linux/Mac only
```

### **Step 4: Test Connection**

Test database connection:

```bash
php test-database.php
```

Expected output:

```
✅ Database connection successful!
Database: blog_app
Host: localhost via TCP/IP
```

### **Step 5: Access Application**

1. **Home Page**: `http://localhost/Blogging-App/Frontend/home/home.html`
2. **Login**: `http://localhost/Blogging-App/Frontend/login/login.html`
3. **Sign Up**: `http://localhost/Blogging-App/Frontend/sign-up/sign-up.html`

### **Step 6: Create Admin Account**

1. Register a new account via the sign-up page
2. In phpMyAdmin, update the user role:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

### **Troubleshooting Installation**

**Issue: Database connection failed**

- Verify MySQL is running: `sudo /opt/lampp/lampp status`
- Check database credentials in `config/database.php`
- Ensure database `blog_app` exists

**Issue: 404 errors on API calls**

- Check Apache mod_rewrite is enabled
- Verify file paths in configuration
- Check file permissions (chmod 644 for files, 755 for directories)

**Issue: CORS errors**

- Verify `Backend/cors.php` is being loaded
- Check browser console for specific errors
- Update allowed origins in `cors.php`

**Issue: Session not persisting**

- Check PHP session directory permissions
- Verify session configuration in `php.ini`
- Clear browser cookies and try again

---

## ⚙️ Configuration

### **Application Settings** (`config/app.php`)

```php
// Environment
define('APP_ENV', 'development');        // development | production | testing
define('APP_NAME', 'Blogging App');
define('APP_URL', 'http://localhost/Blogging-App/Frontend');
define('API_URL', 'http://localhost/Blogging-App/Backend/api');

// Pagination
define('POSTS_PER_PAGE', 12);
define('COMMENTS_PER_PAGE', 20);

// Security
define('CSRF_TOKEN_EXPIRY', 3600);       // 1 hour
define('SESSION_LIFETIME', 86400);       // 24 hours
define('PASSWORD_MIN_LENGTH', 8);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900);       // 15 minutes

// Rate Limiting
define('API_RATE_LIMIT', 100);           // requests per minute
define('API_RATE_WINDOW', 60);           // seconds
```

### **Database Settings** (`config/database.php`)

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'blog_app');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');
define('DB_PORT', 3306);
```

### **CORS Configuration** (`Backend/cors.php`)

```php
$allowedOrigins = [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1'
];

$allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
$allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'];
```

### **Environment-Specific Configuration**

**Development:**

- Error reporting: All errors displayed
- Debug mode: Enabled
- Logging: Verbose
- HTTPS: Not required

**Production:**

- Error reporting: Errors logged, not displayed
- Debug mode: Disabled
- Logging: Errors and warnings only
- HTTPS: Required
- Update `APP_ENV` to `'production'`
- Update `APP_URL` and `API_URL` to production URLs
- Set strong database credentials
- Configure email SMTP settings
- Enable caching mechanisms

---

## 📄 Frontend Pages

### **1. Home Page** (`/home/home.html`)

**Purpose**: Landing page with featured posts and navigation

**Features**:

- Hero section with CTA
- Featured posts grid
- Category navigation
- Search bar (removed in current version)
- Responsive design
- User authentication status display

**Key Components**:

- Navigation header with logo
- Hero banner
- Post grid with pagination
- Footer with social links

---

### **2. Login Page** (`/login/login.html`)

**Purpose**: User authentication

**Features**:

- Username/email login
- Password visibility toggle
- "Remember Me" checkbox
- Forgot password link
- Registration link
- CSRF protection
- Rate limiting (5 attempts)
- Error message display

**Validation**:

- Required field validation
- Email format validation
- Password strength indicator

---

### **3. Sign Up Page** (`/sign-up/sign-up.html`)

**Purpose**: New user registration

**Features**:

- Multi-step form (optional)
- Username availability check (real-time)
- Email validation
- Password strength meter
- Confirm password matching
- Terms and conditions acceptance
- CSRF protection
- Success/error messaging

**Validation**:

- Username: 3-50 characters, alphanumeric + underscore
- Email: Valid format
- Password: Min 8 characters
- Real-time validation feedback

---

### **4. Create Post Page** (`/create-post/create-post.html`)

**Purpose**: Post creation and editing

**Features**:

- Rich text editor
- Title and content fields
- Excerpt generation
- Category selection (multi-select)
- Tag input (dynamic)
- Featured image upload
- Post status selection (draft, published, private, scheduled)
- Schedule date/time picker
- SEO metadata fields
- Allow comments toggle
- Auto-save draft functionality
- Preview mode
- CSRF protection

**Editor Features**:

- Bold, italic, underline formatting
- Headings (H1-H6)
- Lists (ordered, unordered)
- Links and images
- Code blocks
- Blockquotes

---

### **5. Post Detail Page** (`/post-detail/post-detail.html`)

**Purpose**: Display single post with full content

**Features**:

- Post title, content, and metadata
- Author information with avatar
- Publication date and reading time
- View count display
- Like button with count
- Share on social media buttons
- Category and tag links
- Comments section (nested replies)
- Comment form
- Related posts (optional)
- Edit/delete buttons (for author/admin)

**Interactions**:

- Like/unlike post
- Add comment
- Reply to comments
- Edit own comments
- Delete own comments
- Share to social platforms

---

### **6. Profile Page** (`/profile/profile.html`)

**Purpose**: User profile and post management

**Features**:

- User avatar and bio
- Social media links
- Statistics (posts, likes, comments)
- User's post list with filtering
- Post status indicators
- Quick edit/delete actions
- Edit profile button
- Responsive tabs/sections

**Sections**:

- Profile overview
- Published posts
- Draft posts
- Liked posts
- Comment activity

---

### **7. Settings Page** (`/settings/settings.html`)

**Purpose**: User account and preference management

**Features**:

**Account Settings**:

- Update profile information
- Change email address
- Update password (with current password verification)
- Upload/change avatar
- Update bio and location
- Social media links

**Notification Settings**:

- Email notifications toggle
- Comment notifications
- Like notifications
- Marketing emails
- Newsletter subscription

**Privacy Settings**:

- Profile visibility (public/private)
- Show/hide email address
- Allow comments on posts
- Activity visibility

**Danger Zone**:

- Delete account with confirmation
- Data export (optional)

---

### **8. About Page** (`/about/about.html`)

**Purpose**: Information about the platform

**Features**:

- Mission statement
- Team members (with photos and bios)
- Platform features overview
- Social media links
- Contact information link

---

### **9. Contact Page** (`/contact/contact.html`)

**Purpose**: User communication with platform admins

**Features**:

- Contact form with fields:
  - Name
  - Email
  - Subject
  - Message
- Form validation
- Success/error messages
- CSRF protection
- Rate limiting
- Email notification (optional)

---

## 🔧 Backend Structure

### **Models** (`Backend/models/`)

#### **Database.php**

- Singleton pattern for database connection
- PDO wrapper with error handling
- Query execution methods
- Transaction support
- Connection retry logic

#### **User.php**

- User CRUD operations
- Authentication methods (login, logout)
- Password hashing and verification
- Email verification
- Password reset functionality
- Profile management
- Remember me token handling

#### **Post.php**

- Post CRUD operations
- Post listing with filtering
- Search functionality
- Category and tag management
- Like/unlike functionality
- View count tracking
- Slug generation
- Related posts algorithm

#### **Comment.php**

- Comment CRUD operations
- Nested comment handling
- Comment moderation
- Like functionality
- Reply threading
- Comment count tracking

#### **Category.php**

- Category CRUD operations
- Hierarchical category support
- Post count per category
- Slug generation
- Category tree building

---

### **Utilities** (`Backend/utils/`)

#### **Security.php**

Comprehensive security utility class:

**Methods**:

- `sanitize($input)`: Clean user input
- `verifyCSRFToken($token)`: Validate CSRF tokens
- `generateCSRFToken()`: Create secure tokens
- `requireLogin()`: Enforce authentication
- `isLoggedIn()`: Check auth status
- `getCurrentUserId()`: Get current user ID
- `hasRole($role)`: Check user role
- `validatePassword($password)`: Password strength check
- `hashPassword($password)`: Bcrypt hashing
- `verifyPassword($password, $hash)`: Verify password
- `rateLimit($key, $maxAttempts, $decay)`: Rate limiting
- `logSecurityEvent($event)`: Security audit logging
- `validateFileUpload($file)`: File validation
- `generateSecureFilename()`: Secure filename creation

---

### **API Endpoints** (`Backend/api/`)

**Structure**: Organized by resource type

```
api/
├── auth/               # Authentication
│   ├── register.php
│   ├── login.php
│   ├── logout.php
│   ├── status.php
│   ├── csrf-token.php
│   ├── verify-email.php
│   └── check-username.php
├── posts/              # Post management
│   ├── create.php
│   ├── create-flexible.php
│   ├── list.php
│   ├── get.php
│   ├── update.php
│   ├── delete.php
│   ├── like.php
│   └── categories.php
├── comments/           # Comment management
│   ├── create.php
│   ├── list.php
│   ├── update.php
│   ├── delete.php
│   └── moderate.php
└── users/              # User management (future)
```

---

## 🔄 Development Workflow

### **Git Workflow**

```bash
# Clone repository
git clone https://github.com/Graviton17/Blogging-App.git
cd Blogging-App

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

### **Commit Message Convention**

Follow conventional commits:

```
feat: Add new feature
fix: Fix bug in post creation
docs: Update documentation
style: Format code
refactor: Refactor authentication logic
test: Add unit tests
chore: Update dependencies
```

### **Sync Script**

Use `xampp-sync.sh` to sync changes to XAMPP:

```bash
./xampp-sync.sh
```

This script:

- Syncs Frontend files
- Syncs Backend files
- Syncs config files
- Sets proper permissions
- Shows sync status

---

## 🧪 Testing

### **Manual Testing Checklist**

#### **Authentication**

- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Logout functionality
- [ ] Remember Me functionality
- [ ] Password reset flow
- [ ] Email verification
- [ ] Session timeout

#### **Posts**

- [ ] Create new post (draft, published)
- [ ] Edit existing post
- [ ] Delete post
- [ ] View post list with pagination
- [ ] Filter posts by category
- [ ] Search posts
- [ ] Like/unlike post
- [ ] Share post on social media
- [ ] View count increment

#### **Comments**

- [ ] Add comment to post
- [ ] Reply to comment
- [ ] Edit own comment
- [ ] Delete own comment
- [ ] Like comment
- [ ] Moderate comment (admin/author)

#### **Profile**

- [ ] Update profile information
- [ ] Upload avatar
- [ ] View user posts
- [ ] Update privacy settings

#### **Settings**

- [ ] Change password
- [ ] Update notification preferences
- [ ] Update privacy settings
- [ ] Delete account

### **Browser Compatibility Testing**

Test on:

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (Chrome, Safari)

### **Responsive Testing**

Test breakpoints:

- Desktop: 1920px, 1440px, 1024px
- Tablet: 768px
- Mobile: 375px, 320px

---

## 🚀 Deployment

### **Pre-Deployment Checklist**

#### **Configuration**

- [ ] Update `APP_ENV` to `'production'`
- [ ] Set production URLs in `config/app.php`
- [ ] Configure database credentials
- [ ] Set up SMTP email configuration
- [ ] Update CORS allowed origins
- [ ] Generate new secret keys

#### **Security**

- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Configure security headers
- [ ] Disable error display (log only)
- [ ] Review file permissions
- [ ] Enable rate limiting
- [ ] Configure firewall rules

#### **Performance**

- [ ] Enable PHP opcache
- [ ] Configure database indexes
- [ ] Set up CDN for static assets
- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Minify CSS/JS (optional)

#### **Monitoring**

- [ ] Set up error logging
- [ ] Configure backup system
- [ ] Set up uptime monitoring
- [ ] Configure analytics

### **Deployment Steps**

#### **1. Shared Hosting (cPanel)**

```bash
# 1. Create database via cPanel
# 2. Upload files via FTP/SFTP
# 3. Import database via phpMyAdmin
# 4. Update config files
# 5. Set file permissions (755 for directories, 644 for files)
# 6. Test all functionalities
```

#### **2. VPS/Dedicated Server**

```bash
# Install LAMP stack
sudo apt update
sudo apt install apache2 mysql-server php libapache2-mod-php php-mysql

# Enable required PHP extensions
sudo apt install php-mbstring php-curl php-json php-xml

# Clone repository
cd /var/www/html
git clone https://github.com/Graviton17/Blogging-App.git

# Set permissions
sudo chown -R www-data:www-data Blogging-App
sudo chmod -R 755 Blogging-App
sudo chmod -R 777 Blogging-App/uploads Blogging-App/logs

# Configure Apache virtual host
sudo nano /etc/apache2/sites-available/blogging-app.conf

# Enable site and restart Apache
sudo a2ensite blogging-app.conf
sudo systemctl restart apache2

# Import database
mysql -u root -p blog_app < database/blog_app.sql
```

#### **3. Docker Deployment** (Optional)

Create `docker-compose.yml`:

```yaml
version: "3.8"
services:
  web:
    image: php:7.4-apache
    ports:
      - "80:80"
    volumes:
      - ./:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: blog_app
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

Deploy:

```bash
docker-compose up -d
```

### **Post-Deployment**

- [ ] Test all critical functionalities
- [ ] Monitor error logs
- [ ] Check SSL certificate
- [ ] Verify backups are running
- [ ] Test email notifications
- [ ] Monitor performance
- [ ] Set up Google Analytics (optional)
- [ ] Submit sitemap to search engines

---

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Database Connection Failed**

**Symptoms**: "Database connection error" or "PDO exception"

**Solutions**:

```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p -h localhost

# Verify credentials in config/database.php
# Check if database exists
SHOW DATABASES;
```

#### **2. CSRF Token Validation Failed**

**Symptoms**: "Invalid CSRF token" error on form submissions

**Solutions**:

- Clear browser cache and cookies
- Verify CSRF token is being fetched before form submission
- Check token expiry time in config
- Ensure JavaScript is not disabled
- Verify CORS configuration

#### **3. File Upload Fails**

**Symptoms**: "File upload error" or images not saving

**Solutions**:

```bash
# Check directory permissions
chmod 777 uploads/

# Verify PHP upload settings
php -i | grep upload

# Check php.ini
upload_max_filesize = 10M
post_max_size = 10M
```

#### **4. Session Not Persisting**

**Symptoms**: User gets logged out immediately

**Solutions**:

- Check session directory permissions
- Verify session configuration:

```php
session.save_path = "/tmp"
session.gc_maxlifetime = 86400
```

- Clear browser cookies
- Check for session_destroy() calls

#### **5. API Returns 404**

**Symptoms**: API endpoints not found

**Solutions**:

- Verify file paths in API URLs
- Check Apache mod_rewrite is enabled
- Review .htaccess files
- Check file permissions (644)
- Verify API_URL in config

#### **6. Slow Page Load**

**Symptoms**: Pages take long to load

**Solutions**:

- Enable opcache in php.ini
- Optimize database queries (add indexes)
- Enable browser caching
- Optimize images
- Use CDN for static assets
- Check for N+1 query problems

### **Debug Mode**

Enable debugging in development:

```php
// config/app.php
define('APP_ENV', 'development');

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Enable query logging
define('DEBUG_QUERIES', true);
```

### **Log Files**

Check application logs:

```bash
# Application logs
tail -f logs/security.log
tail -f logs/error.log

# Apache logs
tail -f /var/log/apache2/error.log
tail -f /var/log/apache2/access.log

# MySQL logs
tail -f /var/log/mysql/error.log
```

---

## 📞 Support & Contact

### **Documentation**

- GitHub Repository: https://github.com/Graviton17/Blogging-App
- Issues: https://github.com/Graviton17/Blogging-App/issues

### **Community**

- Report bugs via GitHub Issues
- Feature requests via GitHub Discussions
- Security vulnerabilities: Contact maintainer directly

---

## 📝 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🙏 Acknowledgments

- **Font Awesome**: Icon library
- **Google Fonts**: Typography
- **PHP Community**: Framework and best practices
- **MySQL**: Database management
- **Apache**: Web server
- **XAMPP**: Development environment

---

## 📊 Project Statistics

- **Total Files**: 100+
- **Lines of Code**: ~15,000
- **Database Tables**: 11
- **API Endpoints**: 25+
- **Frontend Pages**: 9
- **Languages**: PHP, JavaScript, HTML, CSS, SQL
- **Development Time**: ~300 hours
- **Last Updated**: October 15, 2025

---

## 🗺️ Roadmap

### **Version 1.1** (Planned)

- [ ] Email notifications system
- [ ] Advanced search with filters
- [ ] Post bookmarking
- [ ] User following system
- [ ] Mobile app (PWA)

### **Version 1.2** (Future)

- [ ] Multi-language support (i18n)
- [ ] Dark mode toggle
- [ ] Advanced analytics dashboard
- [ ] REST API documentation (Swagger)
- [ ] Two-factor authentication (2FA)

### **Version 2.0** (Future)

- [ ] GraphQL API
- [ ] Real-time notifications (WebSockets)
- [ ] Video post support
- [ ] Advanced media gallery
- [ ] AI-powered content recommendations

---

**End of Documentation**

_For additional support or questions, please refer to the GitHub repository or contact the maintainer._
