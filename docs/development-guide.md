# Development Guide - Blogging App

## 🚀 Development Setup & Workflow

This document provides comprehensive guidelines for setting up the development environment, coding standards, and workflow procedures for the blogging application.

---

## 🛠️ Prerequisites & System Requirements

### Required Software

- **PHP**: Version 8.0 or higher
- **MySQL/MariaDB**: Version 8.0+ or MariaDB 10.5+
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Composer**: Latest version for PHP dependency management
- **Node.js**: Version 16+ (for build tools and npm packages)
- **Git**: Latest version for version control

### Recommended Development Tools

- **Code Editor**: VS Code with PHP extensions
- **Database Client**: phpMyAdmin, MySQL Workbench, or TablePlus
- **API Testing**: Postman or Insomnia
- **Browser DevTools**: Chrome DevTools or Firefox Developer Tools

---

## 📁 Project Structure

### Complete Folder Structure

```
Blogging-App/
├── .git/                       # Git version control
├── .gitignore                  # Git ignore rules
├── .htaccess                   # Apache rewrite rules
├── README.md                   # Project overview
├── composer.json               # PHP dependencies
├── package.json               # Node.js dependencies
├──
├── docs/                      # Project documentation
│   ├── README.md
│   ├── database-schema.md
│   ├── api-documentation.md
│   ├── ui-ux-design.md
│   ├── development-guide.md
│   └── feature-requirements.md
│
├── config/                    # Configuration files
│   ├── database.php
│   ├── app.php
│   ├── mail.php
│   └── constants.php
│
├── Backend/                   # PHP backend
│   ├── api/                   # API endpoints
│   │   ├── auth/
│   │   │   ├── login.php
│   │   │   ├── register.php
│   │   │   ├── logout.php
│   │   │   └── forgot-password.php
│   │   ├── posts/
│   │   │   ├── index.php
│   │   │   ├── create.php
│   │   │   ├── update.php
│   │   │   ├── delete.php
│   │   │   └── upload-image.php
│   │   ├── users/
│   │   │   ├── profile.php
│   │   │   └── upload-avatar.php
│   │   ├── comments/
│   │   │   ├── create.php
│   │   │   ├── update.php
│   │   │   └── delete.php
│   │   └── admin/
│   │       ├── dashboard.php
│   │       └── moderate.php
│   │
│   ├── models/                # Data models
│   │   ├── User.php
│   │   ├── Post.php
│   │   ├── Comment.php
│   │   ├── Category.php
│   │   └── Database.php
│   │
│   ├── controllers/           # Business logic
│   │   ├── AuthController.php
│   │   ├── PostController.php
│   │   ├── UserController.php
│   │   └── CommentController.php
│   │
│   ├── middleware/           # Request middleware
│   │   ├── AuthMiddleware.php
│   │   ├── AdminMiddleware.php
│   │   └── RateLimitMiddleware.php
│   │
│   ├── utils/                # Utility functions
│   │   ├── Security.php
│   │   ├── Validation.php
│   │   ├── FileUpload.php
│   │   └── EmailSender.php
│   │
│   └── includes/             # Common includes
│       ├── init.php
│       ├── functions.php
│       └── session.php
│
├── Frontend/                 # Frontend files
│   ├── home/
│   │   ├── home.html
│   │   ├── style.css
│   │   └── script.js
│   ├── login/
│   │   ├── login.html
│   │   ├── style.css
│   │   └── script.js
│   ├── sign-up/
│   │   ├── sign-up.html
│   │   ├── style.css
│   │   └── script.js
│   ├── dashboard/
│   │   ├── dashboard.html
│   │   ├── style.css
│   │   └── script.js
│   ├── post-create/
│   │   ├── create-post.html
│   │   ├── style.css
│   │   └── script.js
│   ├── post-view/
│   │   ├── post.html
│   │   ├── style.css
│   │   └── script.js
│   └── assets/
│       ├── css/
│       │   ├── main.css
│       │   ├── components.css
│       │   └── utilities.css
│       ├── js/
│       │   ├── main.js
│       │   ├── api.js
│       │   └── utils.js
│       └── images/
│           └── (image files)
│
├── database/                 # Database files
│   ├── migrations/
│   │   ├── 001_create_users_table.sql
│   │   ├── 002_create_posts_table.sql
│   │   └── (other migration files)
│   ├── seeds/
│   │   ├── default_categories.sql
│   │   └── sample_data.sql
│   └── blog_app.sql         # Complete database dump
│
├── uploads/                  # User uploaded files
│   ├── avatars/
│   ├── images/
│   └── media/
│
├── logs/                     # Application logs
│   ├── error.log
│   ├── access.log
│   └── debug.log
│
└── tests/                    # Test files
    ├── unit/
    ├── integration/
    └── fixtures/
```

---

## 🔧 Local Development Setup

### 1. Environment Setup (XAMPP/WAMP/LAMP)

**For Windows (XAMPP):**

```bash
# Download and install XAMPP
# Start Apache and MySQL services
# Navigate to htdocs folder
cd C:\xampp\htdocs
git clone <repository-url> blogging-app
cd blogging-app
```

**For macOS (MAMP/Homebrew):**

```bash
# Using Homebrew
brew install php@8.1 mysql
brew services start mysql
brew services start httpd

# Clone repository
git clone <repository-url> blogging-app
cd blogging-app
```

**For Linux (LAMP):**

```bash
# Install LAMP stack
sudo apt update
sudo apt install apache2 mysql-server php8.1 php8.1-mysql php8.1-curl php8.1-json

# Clone repository
git clone <repository-url> /var/www/html/blogging-app
cd /var/www/html/blogging-app
```

### 2. Database Setup

**Create Database:**

```sql
CREATE DATABASE blog_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON blog_app.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;
```

**Import Database Schema:**

```bash
# Import the complete database structure
mysql -u blog_user -p blog_app < database/blog_app.sql

# Or run migrations individually
mysql -u blog_user -p blog_app < database/migrations/001_create_users_table.sql
mysql -u blog_user -p blog_app < database/migrations/002_create_posts_table.sql
# ... continue with other migrations
```

### 3. Configuration Setup

**Create `config/database.php`:**

```php
<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'blog_user');
define('DB_PASS', 'strong_password');
define('DB_NAME', 'blog_app');
define('DB_CHARSET', 'utf8mb4');

// Database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
```

**Create `config/app.php`:**

```php
<?php
// Application settings
define('APP_NAME', 'Blogging App');
define('APP_URL', 'http://localhost/blogging-app');
define('APP_ENV', 'development'); // development, staging, production

// Security settings
define('SECRET_KEY', 'your-secret-key-here-change-in-production');
define('SESSION_LIFETIME', 7200); // 2 hours in seconds

// Upload settings
define('UPLOAD_MAX_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_PATH', __DIR__ . '/../uploads/');
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Pagination
define('POSTS_PER_PAGE', 10);
define('COMMENTS_PER_PAGE', 20);

// Email settings (if using mail functionality)
define('MAIL_FROM', 'noreply@yourdomain.com');
define('MAIL_FROM_NAME', APP_NAME);
?>
```

### 4. Install Dependencies

**PHP Dependencies (if using Composer):**

```bash
# Install Composer (if not already installed)
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install dependencies
composer install
```

**Frontend Dependencies (if using npm):**

```bash
# Install Node.js dependencies
npm install

# Build assets (if using build tools)
npm run build
```

---

## 📝 Coding Standards & Guidelines

### PHP Coding Standards (PSR-12)

**File Structure:**

```php
<?php
declare(strict_types=1);

namespace BlogApp\Models;

use PDO;
use PDOException;

/**
 * User model class
 * Handles user-related database operations
 */
class User
{
    private PDO $db;

    public function __construct(PDO $database)
    {
        $this->db = $database;
    }

    public function createUser(array $userData): ?int
    {
        // Implementation here
    }
}
```

**Key PHP Standards:**

1. **PSR-12 Compliance**: Follow PHP Standards Recommendations
2. **Type Declarations**: Use strict typing when possible
3. **Naming Conventions**: CamelCase for classes, snake_case for variables
4. **Error Handling**: Use try-catch blocks and proper exception handling
5. **Security**: Always use prepared statements for database queries

### HTML/CSS Standards

**HTML Structure:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Page description" />
    <title>Page Title - Blogging App</title>
    <link rel="stylesheet" href="assets/css/main.css" />
  </head>
  <body>
    <header role="banner">
      <!-- Header content -->
    </header>

    <main role="main">
      <!-- Main content -->
    </main>

    <footer role="contentinfo">
      <!-- Footer content -->
    </footer>

    <script src="assets/js/main.js"></script>
  </body>
</html>
```

**CSS Standards:**

```css
/* Use CSS custom properties */
:root {
  --primary-color: #2563eb;
  --text-color: #1f2937;
  --border-radius: 0.375rem;
}

/* Follow BEM methodology */
.blog-post {
  /* Block */
}

.blog-post__title {
  /* Element */
}

.blog-post--featured {
  /* Modifier */
}

/* Use mobile-first approach */
.container {
  width: 100%;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
    margin: 0 auto;
  }
}
```

### JavaScript Standards

**ES6+ Features:**

```javascript
// Use const/let instead of var
const API_BASE_URL = "/blogging-app/backend/api";

// Use arrow functions
const fetchPosts = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts?page=${page}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

// Use template literals
const createPostHTML = (post) => {
  return `
        <article class="blog-post">
            <h2 class="blog-post__title">${post.title}</h2>
            <p class="blog-post__excerpt">${post.excerpt}</p>
        </article>
    `;
};
```

---

## 🔒 Security Guidelines

### 1. Input Validation & Sanitization

```php
// Validate and sanitize user input
function validateEmail($email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function sanitizeString($input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// Use prepared statements
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
```

### 2. Password Security

```php
// Hash passwords
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Verify passwords
if (password_verify($inputPassword, $hashedPassword)) {
    // Password is correct
}
```

### 3. CSRF Protection

```php
// Generate CSRF token
function generateCSRFToken(): string {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Verify CSRF token
function verifyCSRFToken($token): bool {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
```

### 4. File Upload Security

```php
function validateUploadedFile($file): bool {
    // Check file size
    if ($file['size'] > UPLOAD_MAX_SIZE) {
        return false;
    }

    // Check file type
    $fileType = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($fileType, ALLOWED_IMAGE_TYPES)) {
        return false;
    }

    // Check if it's a real image
    if (!getimagesize($file['tmp_name'])) {
        return false;
    }

    return true;
}
```

---

## 🧪 Testing Guidelines

### Unit Testing Structure

```php
<?php
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    private $user;
    private $mockDb;

    protected function setUp(): void
    {
        $this->mockDb = $this->createMock(PDO::class);
        $this->user = new User($this->mockDb);
    }

    public function testCreateUser(): void
    {
        // Test implementation
        $userData = [
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password123'
        ];

        $result = $this->user->createUser($userData);
        $this->assertIsInt($result);
    }
}
```

### Frontend Testing (with Jest)

```javascript
// test/api.test.js
import { fetchPosts } from "../Frontend/assets/js/api.js";

// Mock fetch
global.fetch = jest.fn();

describe("API Functions", () => {
  test("fetchPosts returns data correctly", async () => {
    const mockData = {
      success: true,
      data: [{ id: 1, title: "Test Post" }],
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchPosts();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });
});
```

---

## 🚀 Deployment Guidelines

### Production Environment Setup

**1. Server Requirements:**

- PHP 8.1+ with required extensions
- MySQL 8.0+ or MariaDB 10.5+
- HTTPS/SSL certificate
- Proper file permissions
- Regular backups

**2. Configuration Changes:**

```php
// config/app.php (Production)
define('APP_ENV', 'production');
define('DEBUG_MODE', false);

// Enable error logging, disable display
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '/path/to/logs/php-errors.log');
```

**3. .htaccess Configuration:**

```apache
RewriteEngine On

# Redirect HTTP to HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API routing
RewriteRule ^api/(.*)$ Backend/api/$1 [QSA,L]

# Frontend routing
RewriteRule ^login$ Frontend/login/login.html [L]
RewriteRule ^register$ Frontend/sign-up/sign-up.html [L]
RewriteRule ^dashboard$ Frontend/dashboard/dashboard.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
```

### Deployment Checklist

- [ ] Update configuration files for production
- [ ] Set proper file permissions (644 for files, 755 for directories)
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure error logging
- [ ] Test all functionality
- [ ] Set up monitoring and alerts
- [ ] Update DNS settings
- [ ] Create deployment documentation

---

## 📊 Performance Optimization

### Database Optimization

- Use indexes on frequently queried columns
- Implement database connection pooling
- Use query caching where appropriate
- Regular database maintenance (ANALYZE, OPTIMIZE)

### Frontend Optimization

- Minify and compress CSS/JavaScript
- Optimize images (WebP format, lazy loading)
- Use CDN for static assets
- Implement caching strategies
- Enable Gzip compression

### PHP Optimization

- Use OPcache for bytecode caching
- Implement Redis or Memcached for session storage
- Optimize autoloading
- Use appropriate data structures
- Profile and optimize slow queries

---

## 🔄 Version Control Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/user-authentication
git add .
git commit -m "Add user registration functionality"
git push origin feature/user-authentication

# Create pull request, then merge to main
git checkout main
git pull origin main
git merge feature/user-authentication
git push origin main
```

### Commit Message Format

```
type(scope): brief description

Detailed explanation if needed

- Bullet points for changes
- Reference issue numbers #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 📋 Development Workflow

### Daily Development Process

1. **Start**: Pull latest changes from main branch
2. **Plan**: Check feature requirements and create tasks
3. **Develop**: Write code following standards
4. **Test**: Run unit tests and manual testing
5. **Review**: Self-review and code quality check
6. **Commit**: Push changes with descriptive messages
7. **Deploy**: Test on staging environment

### Code Review Checklist

- [ ] Code follows project standards
- [ ] Security vulnerabilities addressed
- [ ] Performance considerations reviewed
- [ ] Tests pass and coverage is adequate
- [ ] Documentation updated if needed
- [ ] No debugging code left in
- [ ] Error handling implemented properly

This development guide provides a comprehensive foundation for building and maintaining the blogging application with proper standards and practices.
