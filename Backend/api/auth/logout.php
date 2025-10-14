<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../utils/Security.php';
require_once '../../models/Database.php';
require_once '../../models/User.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Check if user is logged in
    if (!Security::isLoggedIn()) {
        echo json_encode([
            'success' => true,
            'message' => 'Already logged out'
        ]);
        exit;
    }
    
    $userId = Security::getCurrentUserId();
    $username = $_SESSION['username'] ?? 'unknown';
    
    // Clear remember me token if exists (don't let this fail the logout)
    if (isset($_COOKIE['remember_token'])) {
        try {
            $user = new User();
            $user->clearRememberToken($userId);
            setcookie('remember_token', '', time() - 3600, '/', '', false, true);
        } catch (Exception $e) {
            // Continue even if clearing remember token fails
            error_log('Failed to clear remember token: ' . $e->getMessage());
        }
    }
    
    // Log logout event (don't let this fail the logout)
    try {
        Security::logSecurityEvent('user_logout', [
            'user_id' => $userId,
            'username' => $username
        ]);
    } catch (Exception $e) {
        // Continue even if logging fails
        error_log('Failed to log logout event: ' . $e->getMessage());
    }
    
    // Clear all session variables
    $_SESSION = array();
    
    // Destroy the session cookie
    if (isset($_COOKIE[session_name()])) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Destroy session
    session_destroy();
    
    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
    
} catch (Exception $e) {
    error_log('Logout error: ' . $e->getMessage());
    
    // Even on error, try to clear the session
    try {
        $_SESSION = array();
        session_destroy();
    } catch (Exception $sessionError) {
        error_log('Session destroy error: ' . $sessionError->getMessage());
    }
    
    // Return success anyway - client-side logout should work
    echo json_encode([
        'success' => true,
        'message' => 'Logged out (with warnings)'
    ]);
}
?>