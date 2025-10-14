<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../models/Category.php';
require_once '../../utils/Security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $category = new Category();
    
    // Get categories with post counts
    $categories = $category->getAllWithPostCount();
    
    echo json_encode([
        'success' => true,
        'categories' => $categories
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>