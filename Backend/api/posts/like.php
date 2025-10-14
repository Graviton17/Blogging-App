<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../utils/Security.php';
require_once '../../models/Database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Check if user is logged in
    Security::requireLogin();
    
    $userId = Security::getCurrentUserId();
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['post_id'])) {
        throw new Exception('Post ID is required');
    }
    
    $postId = (int)$input['post_id'];
    
    if ($postId <= 0) {
        throw new Exception('Invalid post ID');
    }
    
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    // Check if user already liked this post
    $checkStmt = $pdo->prepare("SELECT id FROM likes WHERE user_id = ? AND post_id = ?");
    $checkStmt->execute([$userId, $postId]);
    $existingLike = $checkStmt->fetch();
    
    $liked = false;
    
    if ($existingLike) {
        // Unlike the post
        $deleteStmt = $pdo->prepare("DELETE FROM likes WHERE user_id = ? AND post_id = ?");
        $deleteStmt->execute([$userId, $postId]);
        $liked = false;
    } else {
        // Like the post
        $insertStmt = $pdo->prepare("INSERT INTO likes (user_id, post_id) VALUES (?, ?)");
        $insertStmt->execute([$userId, $postId]);
        $liked = true;
    }
    
    // Get updated like count
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM likes WHERE post_id = ?");
    $countStmt->execute([$postId]);
    $likeCount = $countStmt->fetchColumn();
    
    // Update the post's like count in posts table (if you have that column)
    $updateStmt = $pdo->prepare("UPDATE posts SET like_count = ? WHERE id = ?");
    $updateStmt->execute([$likeCount, $postId]);
    
    echo json_encode([
        'success' => true,
        'liked' => $liked,
        'like_count' => (int)$likeCount,
        'message' => $liked ? 'Post liked successfully' : 'Post unliked successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>