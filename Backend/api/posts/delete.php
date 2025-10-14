<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../models/Post.php';
require_once '../../utils/Security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Check if user is logged in
    Security::requireLogin();
    
    // Get JSON input for DELETE request
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Also support URL parameter for backwards compatibility
    $postId = null;
    if (isset($input['id'])) {
        $postId = (int)$input['id'];
    } elseif (isset($_GET['id'])) {
        $postId = (int)$_GET['id'];
    }
    
    if (!$postId) {
        throw new Exception('Post ID is required');
    }
    
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