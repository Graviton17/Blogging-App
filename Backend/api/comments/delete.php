<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../models/Comment.php';
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
    $commentId = null;
    if (isset($input['id'])) {
        $commentId = (int)$input['id'];
    } elseif (isset($_GET['id'])) {
        $commentId = (int)$_GET['id'];
    }
    
    if (!$commentId) {
        throw new Exception('Comment ID is required');
    }
    
    if ($commentId <= 0) {
        throw new Exception('Invalid comment ID');
    }
    
    $comment = new Comment();
    $existingComment = $comment->findById($commentId);
    
    if (!$existingComment) {
        http_response_code(404);
        echo json_encode(['error' => 'Comment not found']);
        exit;
    }
    
    // Check if user can delete this comment
    $canDelete = false;
    
    // Allow deletion if user is the comment author
    if ($existingComment['user_id'] && $existingComment['user_id'] == Security::getCurrentUserId()) {
        $canDelete = true;
    }
    
    // Allow deletion if user is admin
    if (Security::isAdmin()) {
        $canDelete = true;
    }
    
    if (!$canDelete) {
        http_response_code(403);
        echo json_encode(['error' => 'You do not have permission to delete this comment']);
        exit;
    }
    
    // Delete comment
    $result = $comment->delete($commentId);
    
    if (!$result) {
        throw new Exception('Failed to delete comment');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Comment deleted successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>