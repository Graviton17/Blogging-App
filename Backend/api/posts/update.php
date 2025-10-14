<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../models/Post.php';
require_once '../../utils/Security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

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
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON data');
    }
    
    // Verify CSRF token
    if (!isset($input['csrf_token']) || !Security::verifyCSRFToken($input['csrf_token'])) {
        throw new Exception('Invalid CSRF token');
    }
    
    $post = new Post();
    $existingPost = $post->findById($postId);
    
    if (!$existingPost) {
        http_response_code(404);
        echo json_encode(['error' => 'Post not found']);
        exit;
    }
    
    // Check if user can edit this post
    $canEdit = false;
    
    // Allow editing if user is the author
    if ($existingPost['author_id'] == Security::getCurrentUserId()) {
        $canEdit = true;
    }
    
    // Allow editing if user is admin
    if (Security::isAdmin()) {
        $canEdit = true;
    }
    
    if (!$canEdit) {
        http_response_code(403);
        echo json_encode(['error' => 'You do not have permission to edit this post']);
        exit;
    }
    
    // Prepare update data
    $updateData = [];
    $allowedFields = [
        'title', 'content', 'excerpt', 'status',
        'meta_title', 'meta_description', 'allow_comments', 'scheduled_at'
    ];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            if ($field === 'content') {
                $updateData[$field] = $input[$field]; // Don't sanitize content
            } elseif ($field === 'allow_comments') {
                $updateData[$field] = (bool)$input[$field];
            } else {
                $updateData[$field] = Security::sanitize($input[$field]);
            }
        }
    }
    
    // Validate status if provided
    if (isset($updateData['status'])) {
        $validStatuses = ['draft', 'published', 'private', 'scheduled'];
        if (!in_array($updateData['status'], $validStatuses)) {
            throw new Exception('Invalid post status');
        }
        
        // Handle scheduled posts
        if ($updateData['status'] === 'scheduled' && !isset($updateData['scheduled_at'])) {
            throw new Exception('Scheduled date is required for scheduled posts');
        }
    }
    
    if (empty($updateData)) {
        throw new Exception('No valid fields to update');
    }
    
    // Update post
    $result = $post->update($postId, $updateData);
    
    if (!$result) {
        throw new Exception('Failed to update post');
    }
    
    // Handle categories if provided
    if (isset($input['categories']) && is_array($input['categories'])) {
        $post->setCategories($postId, $input['categories']);
    }
    
    // Handle tags if provided
    if (isset($input['tags']) && is_array($input['tags'])) {
        $post->setTags($postId, $input['tags']);
    }
    
    // Get updated post with full details
    $updatedPost = $post->findById($postId);
    
    echo json_encode([
        'success' => true,
        'message' => 'Post updated successfully',
        'post' => $updatedPost
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>