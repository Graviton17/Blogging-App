<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../models/User.php';
require_once '../../utils/Security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get username from query parameter
    if (!isset($_GET['username']) || empty($_GET['username'])) {
        throw new Exception('Username parameter is required');
    }
    
    $username = Security::sanitize($_GET['username']);
    
    // Validate username format
    if (strlen($username) < 3) {
        echo json_encode(['available' => false, 'message' => 'Username too short']);
        exit;
    }
    
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        echo json_encode(['available' => false, 'message' => 'Invalid username format']);
        exit;
    }
    
    // Check if username exists
    $user = new User();
    $exists = $user->usernameExists($username);
    
    echo json_encode([
        'available' => !$exists,
        'username' => $username
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

