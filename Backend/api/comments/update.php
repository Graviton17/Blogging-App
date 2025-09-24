<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once '../../models/Comment.php';
require_once '../../utils/Security.php';
require_once '../../../config/app.php';

try {
    // Check if user is logged in
    Security::requireLogin();
    
    // Get comment ID from URL parameter
    if (!isset($_GET['id'])) {
        throw new Exception('Comment ID is required');
    }
    
    $commentId = (int)$_GET['id'];
    if ($commentId <= 0) {
        throw new Exception('Invalid comment ID');
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
    
    $comment = new Comment();
    $existingComment = $comment->findById($commentId);
    
    if (!$existingComment) {
        http_response_code(404);
        echo json_encode(['error' => 'Comment not found']);
        exit;
    }
    
    // Check if user can edit this comment
    $canEdit = false;
    
    // Allow editing if user is the comment author and it's within edit time limit
    if ($existingComment['user_id'] && $existingComment['user_id'] == Security::getCurrentUserId()) {
        $createdTime = strtotime($existingComment['created_at']);
        $editTimeLimit = $createdTime + (COMMENT_EDIT_TIME_LIMIT * 60); // minutes to seconds
        
        if (time() <= $editTimeLimit) {
            $canEdit = true;
        }
    }
    
    // Allow editing if user is admin
    if (Security::isAdmin()) {
        $canEdit = true;
    }
    
    if (!$canEdit) {
        http_response_code(403);
        echo json_encode(['error' => 'You do not have permission to edit this comment or edit time has expired']);
        exit;
    }
    
    // Prepare update data
    $updateData = [];
    
    if (isset($input['content'])) {
        $content = Security::sanitize($input['content']);
        if (empty($content)) {
            throw new Exception('Comment content cannot be empty');
        }
        $updateData['content'] = $content;
    }
    
    // Only admins can change status
    if (isset($input['status']) && Security::isAdmin()) {
        $validStatuses = ['pending', 'approved', 'spam', 'trash'];
        if (!in_array($input['status'], $validStatuses)) {
            throw new Exception('Invalid comment status');
        }
        $updateData['status'] = $input['status'];
    }
    
    if (empty($updateData)) {
        throw new Exception('No valid fields to update');
    }
    
    // Update comment
    $result = $comment->update($commentId, $updateData);
    
    if (!$result) {
        throw new Exception('Failed to update comment');
    }
    
    // Get updated comment with full details
    $updatedComment = $comment->findById($commentId);
    
    echo json_encode([
        'success' => true,
        'message' => 'Comment updated successfully',
        'comment' => $updatedComment
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>