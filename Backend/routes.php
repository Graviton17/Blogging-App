<?php
/**
 * API Routes Configuration
 * Central routing for all API endpoints
 */

// Load configuration if not already loaded
if (!defined('APP_ENV')) {
    require_once __DIR__ . '/../config/app.php';
}

// Get request method and URI
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Define base path - configurable based on deployment
$scriptName = $_SERVER['SCRIPT_NAME']; // e.g., /Blogging-App/Backend/index.php
$basePath = dirname(dirname($scriptName)); // Remove /Backend/index.php to get /Blogging-App

// If running with PHP built-in server, adjust the path
if (strpos($scriptName, 'index.php') !== false) {
    $basePath = dirname($scriptName); // For direct access to index.php
}

// Parse the URI to get the path
$uri = str_replace($basePath, '', $requestUri);
$uri = parse_url($uri, PHP_URL_PATH);
$uri = trim($uri, '/');

// Remove 'Backend' from the beginning if present (for different deployment scenarios)
if (strpos($uri, 'Backend/') === 0) {
    $uri = substr($uri, 8); // Remove 'Backend/'
}

// Split URI into parts
$uriParts = explode('/', $uri);

// Route the request
if (count($uriParts) >= 2) {
    $module = $uriParts[0]; // 'api'
    $resource = $uriParts[1] ?? ''; // 'auth', 'posts', 'comments', etc.
    $action = $uriParts[2] ?? ''; // 'login', 'register', 'list', etc.

    // Build the file path
    $filePath = __DIR__ . "/{$module}/{$resource}/{$action}.php";

    // Check if the file exists
    if (file_exists($filePath)) {
        require_once $filePath;
    } else {
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint not found',
            'path' => $uri,
            'requested_file' => $filePath,
            'debug' => [
                'script_name' => $scriptName,
                'base_path' => $basePath,
                'request_uri' => $requestUri,
                'parsed_uri' => $uri,
                'uri_parts' => $uriParts
            ]
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'error' => 'Invalid request',
        'message' => 'Please specify a valid API endpoint',
        'example' => 'api/auth/login',
        'debug' => [
            'uri' => $uri,
            'uri_parts' => $uriParts
        ]
    ]);
}
