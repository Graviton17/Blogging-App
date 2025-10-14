<?php
// Debug endpoint to see what we're receiving
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Log all available data
$debug_info = [
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
    'session_user_id' => $_SESSION['user_id'] ?? 'not set',
    'session_data' => $_SESSION,
    'post_data' => $_POST,
    'raw_input' => file_get_contents('php://input'),
    'json_decoded' => null,
    'files' => $_FILES
];

// Try to decode JSON
if (!empty($debug_info['raw_input'])) {
    $debug_info['json_decoded'] = json_decode($debug_info['raw_input'], true);
}

echo json_encode([
    'success' => true,
    'message' => 'Debug information',
    'debug' => $debug_info
], JSON_PRETTY_PRINT);
?>