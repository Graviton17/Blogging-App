<?php
/**
 * Application Configuration
 * Core application settings
 */

// Application Environment
define('APP_ENV', 'development'); // development, production, testing
define('APP_NAME', 'Blogging App');
define('APP_URL', 'http://localhost/Blogging-App/Frontend');
define('API_URL', 'http://localhost/Blogging-App/Backend/api');

// Pagination
define('POSTS_PER_PAGE', 12);
define('COMMENTS_PER_PAGE', 20);

// Logs directory
define('LOGS_DIR', __DIR__ . '/../logs/');

// Security Settings
define('CSRF_TOKEN_EXPIRY', 3600); // 1 hour
define('SESSION_LIFETIME', 86400); // 24 hours
define('PASSWORD_MIN_LENGTH', 8);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900); // 15 minutes

// Email Settings (configure for production)
define('SMTP_HOST', 'smtp.example.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'noreply@bloggingapp.com');
define('SMTP_PASS', '');
define('SMTP_FROM_NAME', 'Blogging App');
define('SMTP_FROM_EMAIL', 'noreply@bloggingapp.com');

// API Rate Limiting
define('API_RATE_LIMIT', 100); // requests per minute
define('API_RATE_WINDOW', 60); // seconds
