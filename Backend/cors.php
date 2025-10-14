<?php
// CORS Configuration for XAMPP
// Enhanced to handle file:// protocol, localhost variations, and XAMPP deployments

$allowedOrigins = [
    'http://localhost',
    'http://localhost:80',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1',
    'http://127.0.0.1:80',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000',
    null // For file:// protocol or no origin header
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? null;

// Check if origin is in allowed list
if (in_array($origin, $allowedOrigins, true)) {
    if ($origin) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // For file:// protocol or direct access without origin header
        header("Access-Control-Allow-Origin: *");
    }
    header("Access-Control-Allow-Credentials: true");
} elseif ($origin === null) {
    // No origin header (direct access, Postman, etc.)
    header("Access-Control-Allow-Origin: *");
} else {
    // For development, allow all origins (remove in production)
    if (defined('APP_ENV') && APP_ENV === 'development') {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
    } else {
        // In production, restrict to specific origins
        header("Access-Control-Allow-Origin: *");
    }
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Origin");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS requests
if (isset($_SERVER["REQUEST_METHOD"]) && $_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}
?>
