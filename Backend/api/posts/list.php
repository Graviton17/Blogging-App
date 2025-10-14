<?php
// Include bootstrap for configuration and security
require_once '../../includes/bootstrap.php';
require_once '../../models/Post.php';
require_once '../../utils/Security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $post = new Post();
    
    // Get query parameters
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : POSTS_PER_PAGE;
    $category = isset($_GET['category']) ? Security::sanitize($_GET['category']) : null;
    $tag = isset($_GET['tag']) ? Security::sanitize($_GET['tag']) : null;
    $search = isset($_GET['search']) ? Security::sanitize($_GET['search']) : null;
    $author = isset($_GET['author']) ? (int)$_GET['author'] : null;
    $status = isset($_GET['status']) ? Security::sanitize($_GET['status']) : 'published';
    $sortBy = isset($_GET['sort']) ? Security::sanitize($_GET['sort']) : 'created_at';
    $sortOrder = isset($_GET['order']) ? Security::sanitize($_GET['order']) : 'DESC';
    
    // Validate sort parameters
    $validSortFields = ['created_at', 'updated_at', 'title', 'view_count'];
    if (!in_array($sortBy, $validSortFields)) {
        $sortBy = 'created_at';
    }
    
    $validSortOrders = ['ASC', 'DESC'];
    if (!in_array(strtoupper($sortOrder), $validSortOrders)) {
        $sortOrder = 'DESC';
    }
    
    // Validate limit
    $limit = min($limit, 50); // Maximum 50 posts per page
    $limit = max($limit, 1);  // Minimum 1 post per page
    
    // Build filters
    $filters = [
        'status' => $status,
        'category' => $category,
        'tag' => $tag,
        'search' => $search,
        'author' => $author,
        'sort_by' => $sortBy,
        'sort_order' => strtoupper($sortOrder)
    ];
    
    // For non-admin users, only show published posts unless viewing own posts
    if (!Security::isAdmin()) {
        if ($author !== Security::getCurrentUserId()) {
            $filters['status'] = 'published';
        }
    }
    
    // Get posts
    $posts = $post->getAll($page, $limit, $filters);
    
    // Get total count for pagination
    $totalPosts = $post->getCount($filters);
    $totalPages = ceil($totalPosts / $limit);
    
    echo json_encode([
        'success' => true,
        'posts' => $posts,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_posts' => $totalPosts,
            'posts_per_page' => $limit,
            'has_next' => $page < $totalPages,
            'has_prev' => $page > 1
        ],
        'filters' => $filters
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>