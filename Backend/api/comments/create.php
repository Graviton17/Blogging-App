<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once '../../models/Comment.php';
require_once '../../models/Post.php';
require_once '../../utils/Security.php';
require_once '../../../config/app.php';

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
    if (!Security::checkRateLimit("comment_$clientId", 5, 300)) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many comment attempts. Please try again later.']);
        exit;
    }
    
    // Validate required fields
    if (!isset($input['post_id']) || !isset($input['content'])) {
        throw new Exception('Post ID and content are required');
    }
    
    $postId = (int)$input['post_id'];
    $content = Security::sanitize($input['content']);
    
    if (empty($content)) {
        throw new Exception('Comment content cannot be empty');
    }
    
    // Check if post exists and allows comments
    $post = new Post();
    $postData = $post->findById($postId);
    
    if (!$postData) {
        throw new Exception('Post not found');
    }
    
    if (!$postData['allow_comments']) {
        throw new Exception('Comments are disabled for this post');
    }
    
    // Prepare comment data
    $commentData = [
        'post_id' => $postId,
        'content' => $content,
        'status' => 'pending', // Default to pending for moderation
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
    ];
    
    // Handle parent comment for replies
    if (isset($input['parent_id']) && !empty($input['parent_id'])) {
        $parentId = (int)$input['parent_id'];
        
        // Verify parent comment exists and belongs to same post
        $comment = new Comment();
        $parentComment = $comment->findById($parentId);
        
        if (!$parentComment || $parentComment['post_id'] != $postId) {
            throw new Exception('Invalid parent comment');
        }
        
        $commentData['parent_id'] = $parentId;
    }
    
    // Handle logged in users
    if (Security::isLoggedIn()) {
        $commentData['user_id'] = Security::getCurrentUserId();
        // Auto-approve comments from registered users (can be changed based on requirements)
        $commentData['status'] = 'approved';
    } else {
        // For guest comments, require name and email
        if (!isset($input['author_name']) || !isset($input['author_email'])) {
            throw new Exception('Name and email are required for guest comments');
        }
        
        $authorName = Security::sanitize($input['author_name']);
        $authorEmail = Security::sanitize($input['author_email']);
        
        if (empty($authorName) || empty($authorEmail)) {
            throw new Exception('Name and email cannot be empty');
        }
        
        if (!Security::validateEmail($authorEmail)) {
            throw new Exception('Invalid email address');
        }
        
        $commentData['author_name'] = $authorName;
        $commentData['author_email'] = $authorEmail;
    }
    
    // Create comment
    $comment = new Comment();
    $commentId = $comment->create($commentData);
    
    // Get created comment with full details
    $createdComment = $comment->findById($commentId);
    
    $message = $commentData['status'] === 'approved' ? 
        'Comment posted successfully' : 
        'Comment submitted and is awaiting moderation';
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'comment' => $createdComment
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>