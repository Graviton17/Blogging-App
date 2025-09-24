<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once '../../utils/Security.php';
require_once '../../models/User.php';

try {
    // Check if user is logged in
    if (!Security::isLoggedIn()) {
        throw new Exception('Not logged in');
    }
    
    $userId = Security::getCurrentUserId();
    
    // Log logout event
    Security::logSecurityEvent('user_logout', [
        'user_id' => $userId,
        'username' => $_SESSION['username'] ?? 'unknown'
    ]);
    
    // Clear remember me token if it exists
    if (isset($_COOKIE['remember_token'])) {
        $user = new User();
        $user->deleteRememberToken($_COOKIE['remember_token']);
        
        // Clear the cookie
        setcookie('remember_token', '', time() - 3600, '/', '', false, true);
    }
    
    // Destroy session
    session_unset();
    session_destroy();
    
    // Start new session for CSRF token
    session_start();
    session_regenerate_id(true);
    
    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>