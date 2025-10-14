<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../models/User.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get token from URL parameter
    if (!isset($_GET['token']) || empty($_GET['token'])) {
        throw new Exception('Verification token is required');
    }
    
    $token = $_GET['token'];
    
    // Verify email
    $user = new User();
    $result = $user->verifyEmail($token);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Email verified successfully. You can now log in.'
        ]);
    } else {
        throw new Exception('Invalid or expired verification token');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>