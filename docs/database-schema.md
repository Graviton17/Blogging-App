# Database Schema - Blogging App

## 🗄️ Database Design Overview

This document outlines the complete database schema for the blogging application, including table structures, relationships, and constraints.

## 📊 Entity Relationship Diagram (ERD)

```
Users (1) ←→ (N) Posts ←→ (N) Comments
  ↓                ↓
  (1)              (N)
  ↓                ↓
Profiles      Post_Categories
                   ↓
                   (N)
                   ↓
               Categories
```

## 📋 Table Structures

### 1. Users Table

**Purpose**: Store user authentication and basic information

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role ENUM('admin', 'author', 'reader') DEFAULT 'reader',
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100),
    reset_token VARCHAR(100),
    reset_token_expires DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Indexes**:

- `idx_users_email` ON (email)
- `idx_users_username` ON (username)
- `idx_users_verification_token` ON (verification_token)

### 2. Profiles Table

**Purpose**: Extended user profile information

```sql
CREATE TABLE profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(255),
    website_url VARCHAR(255),
    social_links JSON,
    location VARCHAR(100),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Categories Table

**Purpose**: Blog post categories for organization

```sql
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6c757d',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Indexes**:

- `idx_categories_slug` ON (slug)
- `idx_categories_active` ON (is_active)

### 4. Posts Table

**Purpose**: Main blog posts content

```sql
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(255),
    author_id INT NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    visibility ENUM('public', 'private', 'password_protected') DEFAULT 'public',
    password_hash VARCHAR(255),
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_posts_author_id (author_id),
    INDEX idx_posts_status (status),
    INDEX idx_posts_published_at (published_at),
    INDEX idx_posts_slug (slug)
);
```

### 5. Post_Categories Table

**Purpose**: Many-to-many relationship between posts and categories

```sql
CREATE TABLE post_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_category (post_id, category_id)
);
```

### 6. Tags Table

**Purpose**: Flexible tagging system for posts

```sql
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tags_slug (slug),
    INDEX idx_tags_usage (usage_count)
);
```

### 7. Post_Tags Table

**Purpose**: Many-to-many relationship between posts and tags

```sql
CREATE TABLE post_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_tag (post_id, tag_id)
);
```

### 8. Comments Table

**Purpose**: User comments on blog posts

```sql
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT,
    parent_id INT NULL,
    author_name VARCHAR(100),
    author_email VARCHAR(100),
    content TEXT NOT NULL,
    status ENUM('approved', 'pending', 'spam', 'trash') DEFAULT 'pending',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_comments_post_id (post_id),
    INDEX idx_comments_user_id (user_id),
    INDEX idx_comments_status (status),
    INDEX idx_comments_parent_id (parent_id)
);
```

### 9. Likes Table

**Purpose**: Track user likes on posts

```sql
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post_like (user_id, post_id)
);
```

### 10. Media Table

**Purpose**: Track uploaded media files

```sql
CREATE TABLE media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    alt_text VARCHAR(255),
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_media_user_id (user_id),
    INDEX idx_media_mime_type (mime_type)
);
```

### 11. Sessions Table

**Purpose**: User session management

```sql
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_last_activity (last_activity)
);
```

### 12. Settings Table

**Purpose**: Application-wide settings

```sql
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔗 Relationships Summary

### One-to-One

- Users ↔ Profiles

### One-to-Many

- Users → Posts (author_id)
- Users → Comments (user_id)
- Posts → Comments (post_id)
- Comments → Comments (parent_id) - Self-referencing

### Many-to-Many

- Posts ↔ Categories (via post_categories)
- Posts ↔ Tags (via post_tags)
- Users ↔ Posts (via likes)

## 📈 Performance Considerations

### Indexes

- Primary keys on all tables
- Foreign key indexes for join performance
- Composite indexes for common query patterns
- Text search indexes for content search

### Optimization Strategies

1. **Denormalization**: `comment_count`, `like_count`, `view_count` in posts table
2. **Caching**: Frequently accessed data like popular posts
3. **Partitioning**: Consider date-based partitioning for large datasets
4. **Archive Strategy**: Move old posts to archive tables

## 🚀 Sample Data Insertion

### Default Categories

```sql
INSERT INTO categories (name, slug, description, color) VALUES
('Technology', 'technology', 'Posts about technology and programming', '#007bff'),
('Lifestyle', 'lifestyle', 'Personal and lifestyle content', '#28a745'),
('Travel', 'travel', 'Travel experiences and guides', '#ffc107'),
('Food', 'food', 'Recipes and food reviews', '#dc3545');
```

### Default Settings

```sql
INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES
('site_title', 'My Blogging App', 'string', 'Website title'),
('site_description', 'A modern blogging platform', 'string', 'Website description'),
('posts_per_page', '10', 'integer', 'Number of posts per page'),
('allow_comments', 'true', 'boolean', 'Enable comments system'),
('require_approval', 'true', 'boolean', 'Comments require approval');
```

## 🔧 Database Triggers

### Update Post Comment Count

```sql
DELIMITER //
CREATE TRIGGER update_post_comment_count
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    UPDATE posts
    SET comment_count = (
        SELECT COUNT(*)
        FROM comments
        WHERE post_id = NEW.post_id AND status = 'approved'
    )
    WHERE id = NEW.post_id;
END//
DELIMITER ;
```

## 📝 Migration Scripts

All table creation scripts should be numbered and version controlled:

- `001_create_users_table.sql`
- `002_create_profiles_table.sql`
- `003_create_categories_table.sql`
- etc.

## 🔒 Security Considerations

1. Use prepared statements for all queries
2. Hash passwords with PHP's `password_hash()`
3. Sanitize all user inputs
4. Implement proper session management
5. Use HTTPS for data transmission
6. Regular backup procedures
