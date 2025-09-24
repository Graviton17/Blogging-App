<?php
/**
 * Categories API - Get all categories
 */

// Include bootstrap
require_once '../../includes/bootstrap.php';
require_once '../../models/Post.php';
require_once '../../utils/Security.php';

try {
    // Only allow GET requests
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed');
    }

    $postModel = new Post();
    $categories = $postModel->getCategories();
    
    echo json_encode([
        'success' => true,
        'categories' => $categories
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>