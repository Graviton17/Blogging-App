<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../utils/Security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once '../../utils/Security.php';

try {
    // Check if user is logged in
    if (!Security::isLoggedIn()) {
        echo json_encode([
            'success' => false,
            'authenticated' => false,
            'message' => 'Not authenticated'
        ]);
        exit;
    }
    
    // Return current user data
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'email' => $_SESSION['email'],
            'role' => $_SESSION['role'],
            'logged_in_at' => $_SESSION['logged_in_at']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>