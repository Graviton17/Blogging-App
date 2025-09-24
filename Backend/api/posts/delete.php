<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once '../../models/Post.php';
require_once '../../utils/Security.php';
require_once '../../../config/app.php';

try {
    // Check if user is logged in
    Security::requireLogin();
    
    // Get post ID from URL parameter
    if (!isset($_GET['id'])) {
        throw new Exception('Post ID is required');
    }
    
    $postId = (int)$_GET['id'];
    if ($postId <= 0) {
        throw new Exception('Invalid post ID');
    }
    
    $post = new Post();
    $existingPost = $post->findById($postId);
    
    if (!$existingPost) {
        http_response_code(404);
        echo json_encode(['error' => 'Post not found']);
        exit;
    }
    
    // Check if user can delete this post
    $canDelete = false;
    
    // Allow deletion if user is the author
    if ($existingPost['author_id'] == Security::getCurrentUserId()) {
        $canDelete = true;
    }
    
    // Allow deletion if user is admin
    if (Security::isAdmin()) {
        $canDelete = true;
    }
    
    if (!$canDelete) {
        http_response_code(403);
        echo json_encode(['error' => 'You do not have permission to delete this post']);
        exit;
    }
    
    // Delete post
    $result = $post->delete($postId);
    
    if (!$result) {
        throw new Exception('Failed to delete post');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Post deleted successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>