<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once '../../models/Post.php';
require_once '../../utils/Security.php';
require_once '../../../config/app.php';

try {
    // Get post ID from URL parameter
    if (!isset($_GET['id'])) {
        throw new Exception('Post ID is required');
    }
    
    $postId = (int)$_GET['id'];
    if ($postId <= 0) {
        throw new Exception('Invalid post ID');
    }
    
    $post = new Post();
    $postData = $post->findById($postId);
    
    if (!$postData) {
        http_response_code(404);
        echo json_encode(['error' => 'Post not found']);
        exit;
    }
    
    // Check if user can view this post
    $canView = true;
    
    if ($postData['status'] !== 'published') {
        $canView = false;
        
        // Allow viewing if user is the author
        if (Security::isLoggedIn() && $postData['author_id'] == Security::getCurrentUserId()) {
            $canView = true;
        }
        
        // Allow viewing if user is admin
        if (Security::isAdmin()) {
            $canView = true;
        }
    }
    
    if (!$canView) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }
    
    // Increment view count for published posts (but not for author/admin viewing their own posts)
    if ($postData['status'] === 'published') {
        $shouldIncrementViews = true;
        
        // Don't increment views if author is viewing their own post
        if (Security::isLoggedIn() && $postData['author_id'] == Security::getCurrentUserId()) {
            $shouldIncrementViews = false;
        }
        
        if ($shouldIncrementViews) {
            $post->incrementViews($postId);
            $postData['view_count']++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'post' => $postData
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>