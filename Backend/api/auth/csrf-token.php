<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../utils/Security.php';

if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Generate CSRF token
    $token = Security::generateCSRFToken();
    
    echo json_encode([
        'success' => true,
        'token' => $token,
        'csrf_token' => $token // Alias for compatibility
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>