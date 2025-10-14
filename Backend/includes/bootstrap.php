<?php
/**
 * Bootstrap file - loads all necessary configurations and dependencies
 * This file should be included at the top of every API endpoint
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    // Set secure session configuration
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_strict_mode', 1);
    ini_set('session.cookie_samesite', 'Lax');
    
    // Set secure flag based on environment
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        ini_set('session.cookie_secure', 1);
    }
    
    // Set session lifetime from config
    if (defined('SESSION_LIFETIME')) {
        ini_set('session.gc_maxlifetime', SESSION_LIFETIME);
        ini_set('session.cookie_lifetime', SESSION_LIFETIME);
    }
    
    // Use a custom session name for security
    session_name('BLOGGING_APP_SESSION');
    
    session_start();
    
    // Regenerate session ID on first login or important operations
    if (!isset($_SESSION['initiated'])) {
        session_regenerate_id(true);
        $_SESSION['initiated'] = true;
        $_SESSION['created_at'] = time();
    }
    
    // Check for session timeout
    if (isset($_SESSION['created_at']) && defined('SESSION_LIFETIME')) {
        if (time() - $_SESSION['created_at'] > SESSION_LIFETIME) {
            session_unset();
            session_destroy();
            session_start();
        } else {
            // Update last activity time
            $_SESSION['last_activity'] = time();
        }
    }
}

// Load configuration files first
require_once __DIR__ . '/../../config/app.php';

// Set error reporting for development
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set default timezone
date_default_timezone_set('UTC');

// Load CORS configuration only in web context
if (isset($_SERVER['HTTP_HOST'])) {
    require_once __DIR__ . '/../cors.php';
}

// Load database configuration
require_once __DIR__ . '/../../config/database.php';

// Set Content-Type header only in web context
if (isset($_SERVER['HTTP_HOST'])) {
    header('Content-Type: application/json');
}

// Define upload directory constants
if (!defined('UPLOAD_DIR')) {
    define('UPLOAD_DIR', __DIR__ . '/../../uploads/');
}

if (!defined('UPLOAD_URL')) {
    define('UPLOAD_URL', APP_URL . '/uploads/');
}

// Ensure upload directory exists
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
    // Create subdirectories
    mkdir(UPLOAD_DIR . 'posts/', 0755, true);
    mkdir(UPLOAD_DIR . 'avatars/', 0755, true);
    mkdir(UPLOAD_DIR . 'temp/', 0755, true);
}

// Global error handler for uncaught exceptions
set_exception_handler(function($exception) {
    error_log($exception->getMessage());
    
    if (APP_ENV === 'development') {
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'An internal server error occurred'
        ]);
    }
    
    http_response_code(500);
    exit();
});

// Global error handler
set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return;
    }
    
    throw new ErrorException($message, 0, $severity, $file, $line);
});
?>