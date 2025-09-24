<?php
/**
 * Bootstrap file - loads all necessary configurations and dependencies
 * This file should be included at the top of every API endpoint
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    // Set secure session configuration
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', 1);
    ini_set('session.use_strict_mode', 1);
    ini_set('session.cookie_samesite', 'Strict');
    
    session_start();
}

// Set error reporting for development
if (!defined('APP_ENV')) {
    define('APP_ENV', 'development');
}

if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set default timezone
date_default_timezone_set('UTC');

// Load configuration files
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/app.php';

// Set CORS headers for API endpoints
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . (APP_ENV === 'development' ? '*' : APP_URL));
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
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