<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../models/Post.php';
require_once '../../utils/Security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Check if user is logged in
    Security::requireLogin();
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON data');
    }
    
    // Verify CSRF token
    if (!isset($input['csrf_token']) || !Security::verifyCSRFToken($input['csrf_token'])) {
        throw new Exception('Invalid CSRF token');
    }
    
    // Validate required fields
    if (!isset($input['title']) || empty(trim($input['title']))) {
        throw new Exception('Post title is required');
    }
    
    if (!isset($input['content']) || empty(trim($input['content']))) {
        throw new Exception('Post content is required');
    }
    
    // Prepare post data
    $postData = [
        'title' => Security::sanitize($input['title']),
        'content' => $input['content'], // Don't sanitize content as it may contain HTML
        'excerpt' => isset($input['excerpt']) ? Security::sanitize($input['excerpt']) : null,
        'author_id' => Security::getCurrentUserId(),
        'status' => isset($input['status']) ? $input['status'] : 'published',
        'meta_title' => isset($input['meta_title']) ? Security::sanitize($input['meta_title']) : null,
        'meta_description' => isset($input['meta_description']) ? Security::sanitize($input['meta_description']) : null,
        'allow_comments' => isset($input['allow_comments']) ? (bool)$input['allow_comments'] : true
    ];
    
    // Validate status
    $validStatuses = ['draft', 'published', 'private', 'scheduled'];
    if (!in_array($postData['status'], $validStatuses)) {
        throw new Exception('Invalid post status');
    }
    
    // Handle scheduled posts
    if ($postData['status'] === 'scheduled') {
        if (!isset($input['scheduled_at'])) {
            throw new Exception('Scheduled date is required for scheduled posts');
        }
        $postData['scheduled_at'] = $input['scheduled_at'];
    }
    
    // Create post
    $post = new Post();
    $postId = $post->create($postData);
    
    // Handle categories if provided
    if (isset($input['categories']) && is_array($input['categories'])) {
        $post->setCategories($postId, $input['categories']);
    }
    
    // Handle tags if provided
    if (isset($input['tags']) && is_array($input['tags'])) {
        $post->setTags($postId, $input['tags']);
    }
    
    // Get created post with full details
    $createdPost = $post->findById($postId);
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Post created successfully',
        'post' => $createdPost
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>