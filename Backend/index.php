<?php
/**
 * Backend Entry Point
 * All API requests are handled through this file
 */

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Load configuration files in proper order
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../config/database.php';

// Load CORS configuration
require_once __DIR__ . '/cors.php';

// Handle routing
require_once __DIR__ . '/routes.php';
