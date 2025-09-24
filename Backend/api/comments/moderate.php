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
require_once '../../utils/Security.php';
require_once '../../../config/app.php';

try {
    // Require admin privileges
    Security::requireAdmin();
    
    // Get comment ID from URL parameter
    if (!isset($_GET['id'])) {
        throw new Exception('Comment ID is required');
    }
    
    $commentId = (int)$_GET['id'];
    if ($commentId <= 0) {
        throw new Exception('Invalid comment ID');
    }
    
    // Get action from URL parameter
    if (!isset($_GET['action'])) {
        throw new Exception('Action is required');
    }
    
    $action = $_GET['action'];
    $validActions = ['approve', 'reject', 'spam'];
    
    if (!in_array($action, $validActions)) {
        throw new Exception('Invalid action');
    }
    
    $comment = new Comment();
    $existingComment = $comment->findById($commentId);
    
    if (!$existingComment) {
        http_response_code(404);
        echo json_encode(['error' => 'Comment not found']);
        exit;
    }
    
    // Perform the moderation action
    $result = false;
    $message = '';
    
    switch ($action) {
        case 'approve':
            $result = $comment->approve($commentId);
            $message = 'Comment approved successfully';
            break;
        case 'reject':
            $result = $comment->reject($commentId);
            $message = 'Comment rejected successfully';
            break;
        case 'spam':
            $result = $comment->markAsSpam($commentId);
            $message = 'Comment marked as spam successfully';
            break;
    }
    
    if (!$result) {
        throw new Exception('Failed to moderate comment');
    }
    
    // Get updated comment
    $updatedComment = $comment->findById($commentId);
    
    echo json_encode([
        'success' => true,
        'message' => $message,
        'comment' => $updatedComment
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>