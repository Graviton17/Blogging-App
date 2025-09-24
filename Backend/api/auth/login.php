<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../models/User.php';
require_once '../../utils/Security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON data');
    }
    
    // Verify CSRF token
    if (!isset($input['csrf_token']) || !Security::verifyCSRFToken($input['csrf_token'])) {
        throw new Exception('Invalid CSRF token');
    }
    
    // Rate limiting
    $clientId = $_SERVER['REMOTE_ADDR'];
    if (!Security::checkRateLimit("login_$clientId", 5, 300)) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many login attempts. Please try again later.']);
        exit;
    }
    
    // Validate required fields
    if (!isset($input['login']) || !isset($input['password'])) {
        throw new Exception('Missing login credentials');
    }
    
    $login = Security::sanitize($input['login']); // Can be username or email
    $password = $input['password'];
    $remember = isset($input['remember']) && $input['remember'];
    
    // Validate input
    if (empty($login) || empty($password)) {
        throw new Exception('Login and password are required');
    }
    
    // Attempt login
    $user = new User();
    $userData = $user->verifyLogin($login, $password);
    
    if (!$userData) {
        // Log failed login attempt
        Security::logSecurityEvent('login_failed', [
            'login' => $login,
            'reason' => 'invalid_credentials'
        ]);
        
        throw new Exception('Invalid login credentials');
    }
    
    // Check if account is verified
    if (!$userData['is_verified']) {
        throw new Exception('Please verify your email address before logging in');
    }
    
    // Check if account is active
    if ($userData['status'] !== 'active') {
        throw new Exception('Account is not active. Please contact support.');
    }
    
    // Set session variables
    $_SESSION['user_id'] = $userData['id'];
    $_SESSION['username'] = $userData['username'];
    $_SESSION['email'] = $userData['email'];
    $_SESSION['role'] = $userData['role'];
    $_SESSION['logged_in_at'] = time();
    
    // Regenerate session ID for security
    session_regenerate_id(true);
    
    // Set remember me cookie if requested
    if ($remember) {
        $token = Security::generateToken();
        $user->createRememberToken($userData['id'], $token);
        
        // Set cookie for 30 days
        setcookie('remember_token', $token, time() + (30 * 24 * 60 * 60), '/', '', false, true);
    }
    
    // Update last login
    $user->updateLastLogin($userData['id']);
    
    // Log successful login
    Security::logSecurityEvent('user_login', [
        'user_id' => $userData['id'],
        'username' => $userData['username'],
        'remember' => $remember
    ]);
    
    // Return user data (excluding sensitive information)
    $responseData = [
        'id' => $userData['id'],
        'username' => $userData['username'],
        'email' => $userData['email'],
        'first_name' => $userData['first_name'],
        'last_name' => $userData['last_name'],
        'role' => $userData['role']
    ];
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => $responseData
    ]);
    
} catch (Exception $e) {
    // Log security event for failed login
    Security::logSecurityEvent('login_failed', [
        'error' => $e->getMessage(),
        'login' => isset($login) ? $login : 'unknown'
    ]);
    
    http_response_code(401);
    echo json_encode(['error' => $e->getMessage()]);
}
?>