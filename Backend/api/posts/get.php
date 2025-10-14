<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../models/Post.php';
require_once '../../models/Database.php';
require_once '../../utils/Security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

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
        echo json_encode([
            'error' => 'Post not found',
            'message' => "No post found with ID: {$postId}",
            'requested_id' => $postId
        ]);
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

    // Add like information if user is logged in
    if (Security::isLoggedIn()) {
        $userId = Security::getCurrentUserId();
        
        // Check if current user liked this post
        $db = Database::getInstance();
        $likeCheckSql = "SELECT id FROM likes WHERE user_id = ? AND post_id = ?";
        $likeCheck = $db->fetch($likeCheckSql, [$userId, $postId]);
        $postData['is_liked'] = (bool)$likeCheck;
    } else {
        $postData['is_liked'] = false;
    }

    // Format author information
    $postData['author_name'] = trim(($postData['first_name'] ?? '') . ' ' . ($postData['last_name'] ?? '')) ?: $postData['username'];
    
    echo json_encode([
        'success' => true,
        'post' => $postData
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage(),
        'message' => 'Failed to retrieve post: ' . $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
}
?>