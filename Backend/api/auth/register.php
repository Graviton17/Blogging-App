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

    require_once '../../models/User.php';
    require_once '../../utils/Security.php';

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
    if (!Security::checkRateLimit("register_$clientId", 3, 300)) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many registration attempts. Please try again later.']);
        exit;
    }
    
    // Validate required fields
    $requiredFields = ['username', 'email', 'password', 'first_name', 'last_name'];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    // Sanitize input
    $userData = [
        'username' => Security::sanitize($input['username']),
        'email' => Security::sanitize($input['email']),
        'password' => $input['password'], // Don't sanitize password
        'first_name' => Security::sanitize($input['first_name']),
        'last_name' => Security::sanitize($input['last_name'])
    ];
    
    // Validate email
    if (!Security::validateEmail($userData['email'])) {
        throw new Exception('Invalid email address');
    }
    
    // Validate password
    $passwordValidation = Security::validatePassword($userData['password']);
    if ($passwordValidation !== true) {
        throw new Exception('Password validation failed: ' . implode(', ', $passwordValidation));
    }
    
    // Create user
    $user = new User();
    $userId = $user->create($userData);
    
    // Log security event
    Security::logSecurityEvent('user_registered', [
        'user_id' => $userId,
        'username' => $userData['username'],
        'email' => $userData['email']
    ]);
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully. Please check your email for verification.',
        'user_id' => $userId
    ]);
    
} catch (Exception $e) {
    // Log security event for failed registration
    Security::logSecurityEvent('registration_failed', [
        'error' => $e->getMessage(),
        'input' => isset($input) ? array_intersect_key($input, array_flip(['username', 'email'])) : []
    ]);
    
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>