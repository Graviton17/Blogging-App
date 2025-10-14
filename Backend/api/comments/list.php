<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../models/Comment.php';
require_once '../../utils/Security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get post ID from URL parameter
    if (!isset($_GET['post_id'])) {
        throw new Exception('Post ID is required');
    }
    
    $postId = (int)$_GET['post_id'];
    if ($postId <= 0) {
        throw new Exception('Invalid post ID');
    }
    
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : COMMENTS_PER_PAGE;
    
    // Validate limit
    $limit = min($limit, 50); // Maximum 50 comments per page
    $limit = max($limit, 1);  // Minimum 1 comment per page
    
    // Get comments
    $comment = new Comment();
    $comments = $comment->getByPost($postId, $page, $limit);
    
    // Get total count for pagination
    $sql = "SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND status = 'approved'";
    $db = Database::getInstance();
    $totalResult = $db->fetch($sql, [$postId]);
    $totalComments = $totalResult ? $totalResult['total'] : 0;
    $totalPages = ceil($totalComments / $limit);
    
    echo json_encode([
        'success' => true,
        'comments' => $comments,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_comments' => $totalComments,
            'comments_per_page' => $limit,
            'has_next' => $page < $totalPages,
            'has_prev' => $page > 1
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>