<?php
require_once __DIR__ . '/Database.php';

/**
 * Post model for handling blog post operations
 */
class Post
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Create a new post
     */
    public function create($postData)
    {
        // Validate required fields
        if (!isset($postData['title']) || !isset($postData['content']) || !isset($postData['author_id'])) {
            throw new Exception("Missing required fields");
        }

        // Generate slug from title
        $slug = $this->generateSlug($postData['title']);
        
        // Ensure slug is unique
        $originalSlug = $slug;
        $counter = 1;
        while ($this->findBySlug($slug)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $sql = "INSERT INTO posts (title, slug, content, excerpt, featured_image, author_id, status, visibility, published_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $publishedAt = ($postData['status'] ?? 'draft') === 'published' ? date('Y-m-d H:i:s') : null;

        $params = [
            $postData['title'],
            $slug,
            $postData['content'],
            $postData['excerpt'] ?? $this->generateExcerpt($postData['content']),
            $postData['featured_image'] ?? null,
            $postData['author_id'],
            $postData['status'] ?? 'draft',
            $postData['visibility'] ?? 'public',
            $publishedAt
        ];

        try {
            $this->db->beginTransaction();
            
            $this->db->execute($sql, $params);
            $postId = $this->db->lastInsertId();
            
            // Handle categories
            if (isset($postData['categories']) && is_array($postData['categories'])) {
                $this->updateCategories($postId, $postData['categories']);
            }
            
            // Handle tags
            if (isset($postData['tags']) && is_array($postData['tags'])) {
                $this->updateTags($postId, $postData['tags']);
            }
            
            $this->db->commit();
            
            return $postId;
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * Find post by ID with full details
     */
    public function findById($id)
    {
        $sql = "SELECT p.*, u.username, u.first_name, u.last_name, pr.avatar_url
                FROM posts p
                JOIN users u ON p.author_id = u.id
                LEFT JOIN profiles pr ON u.id = pr.user_id
                WHERE p.id = ?";
        
        $post = $this->db->fetch($sql, [$id]);
        
        if ($post) {
            // Get categories
            $post['categories'] = $this->getPostCategories($id);
            // Get tags
            $post['tags'] = $this->getPostTags($id);
        }
        
        return $post;
    }

    /**
     * Find post by slug
     */
    public function findBySlug($slug)
    {
        $sql = "SELECT * FROM posts WHERE slug = ?";
        return $this->db->fetch($sql, [$slug]);
    }

    /**
     * Get all posts with pagination and filtering
     */
    public function getAll($options = [])
    {
        $page = $options['page'] ?? 1;
        $limit = $options['limit'] ?? POSTS_PER_PAGE;
        $offset = ($page - 1) * $limit;
        
        $whereConditions = ['p.status = "published"'];
        $params = [];
        
        // Add search filter
        if (isset($options['search']) && !empty($options['search'])) {
            $whereConditions[] = "(p.title LIKE ? OR p.content LIKE ?)";
            $searchTerm = '%' . $options['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        // Add category filter
        if (isset($options['category'])) {
            $whereConditions[] = "EXISTS (
                SELECT 1 FROM post_categories pc 
                JOIN categories c ON pc.category_id = c.id 
                WHERE pc.post_id = p.id AND c.slug = ?
            )";
            $params[] = $options['category'];
        }
        
        // Add author filter
        if (isset($options['author'])) {
            $whereConditions[] = "u.username = ?";
            $params[] = $options['author'];
        }
        
        $whereClause = "WHERE " . implode(' AND ', $whereConditions);
        
        // Order by
        $orderBy = "ORDER BY p.published_at DESC";
        if (isset($options['sort'])) {
            switch ($options['sort']) {
                case 'popular':
                    $orderBy = "ORDER BY p.view_count DESC, p.like_count DESC";
                    break;
                case 'oldest':
                    $orderBy = "ORDER BY p.published_at ASC";
                    break;
            }
        }
        
        $sql = "SELECT p.*, u.username, u.first_name, u.last_name, pr.avatar_url
                FROM posts p
                JOIN users u ON p.author_id = u.id
                LEFT JOIN profiles pr ON u.id = pr.user_id
                $whereClause
                $orderBy
                LIMIT ? OFFSET ?";
        
        $params[] = $limit;
        $params[] = $offset;
        
        $posts = $this->db->fetchAll($sql, $params);
        
        // Add categories and tags to each post
        foreach ($posts as &$post) {
            $post['categories'] = $this->getPostCategories($post['id']);
            $post['tags'] = $this->getPostTags($post['id']);
        }
        
        return $posts;
    }

    /**
     * Get posts by author
     */
    public function getByAuthor($authorId, $page = 1, $status = null)
    {
        $limit = POSTS_PER_PAGE;
        $offset = ($page - 1) * $limit;
        
        $whereConditions = ['p.author_id = ?'];
        $params = [$authorId];
        
        if ($status) {
            $whereConditions[] = 'p.status = ?';
            $params[] = $status;
        }
        
        $whereClause = "WHERE " . implode(' AND ', $whereConditions);
        
        $sql = "SELECT p.*, u.username, u.first_name, u.last_name
                FROM posts p
                JOIN users u ON p.author_id = u.id
                $whereClause
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?";
        
        $params[] = $limit;
        $params[] = $offset;
        
        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Update post
     */
    public function update($id, $postData)
    {
        $allowedFields = ['title', 'content', 'excerpt', 'featured_image', 'status', 'visibility'];
        $updateFields = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (isset($postData[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $postData[$field];
            }
        }

        if (empty($updateFields)) {
            throw new Exception("No valid fields to update");
        }

        // Update slug if title is changed
        if (isset($postData['title'])) {
            $newSlug = $this->generateSlug($postData['title']);
            $existingPost = $this->findBySlug($newSlug);
            
            if (!$existingPost || $existingPost['id'] == $id) {
                $updateFields[] = "slug = ?";
                $params[] = $newSlug;
            }
        }

        // Set published_at if status is changed to published
        if (isset($postData['status']) && $postData['status'] === 'published') {
            $updateFields[] = "published_at = NOW()";
        }

        $params[] = $id;
        $sql = "UPDATE posts SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = ?";
        
        try {
            $this->db->beginTransaction();
            
            $this->db->execute($sql, $params);
            
            // Update categories if provided
            if (isset($postData['categories'])) {
                $this->updateCategories($id, $postData['categories']);
            }
            
            // Update tags if provided
            if (isset($postData['tags'])) {
                $this->updateTags($id, $postData['tags']);
            }
            
            $this->db->commit();
            
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * Delete post
     */
    public function delete($id)
    {
        $sql = "DELETE FROM posts WHERE id = ?";
        return $this->db->execute($sql, [$id]);
    }

    /**
     * Increment view count
     */
    public function incrementViewCount($id)
    {
        $sql = "UPDATE posts SET view_count = view_count + 1 WHERE id = ?";
        return $this->db->execute($sql, [$id]);
    }

    /**
     * Get post categories
     */
    private function getPostCategories($postId)
    {
        $sql = "SELECT c.id, c.name, c.slug, c.color
                FROM categories c
                JOIN post_categories pc ON c.id = pc.category_id
                WHERE pc.post_id = ?";
        
        return $this->db->fetchAll($sql, [$postId]);
    }

    /**
     * Get post tags
     */
    private function getPostTags($postId)
    {
        $sql = "SELECT t.id, t.name, t.slug
                FROM tags t
                JOIN post_tags pt ON t.id = pt.tag_id
                WHERE pt.post_id = ?";
        
        return $this->db->fetchAll($sql, [$postId]);
    }

    /**
     * Update post categories
     */
    private function updateCategories($postId, $categoryIds)
    {
        // Remove existing categories
        $sql = "DELETE FROM post_categories WHERE post_id = ?";
        $this->db->execute($sql, [$postId]);
        
        // Add new categories
        if (!empty($categoryIds)) {
            $sql = "INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)";
            foreach ($categoryIds as $categoryId) {
                $this->db->execute($sql, [$postId, $categoryId]);
            }
        }
    }

    /**
     * Update post tags
     */
    private function updateTags($postId, $tagNames)
    {
        // Remove existing tags
        $sql = "DELETE FROM post_tags WHERE post_id = ?";
        $this->db->execute($sql, [$postId]);
        
        if (!empty($tagNames)) {
            foreach ($tagNames as $tagName) {
                // Find or create tag
                $tagId = $this->findOrCreateTag($tagName);
                
                // Link to post
                $sql = "INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)";
                $this->db->execute($sql, [$postId, $tagId]);
            }
        }
    }

    /**
     * Find or create tag
     */
    private function findOrCreateTag($tagName)
    {
        $slug = $this->generateSlug($tagName);
        
        // Check if tag exists
        $sql = "SELECT id FROM tags WHERE slug = ?";
        $tag = $this->db->fetch($sql, [$slug]);
        
        if ($tag) {
            // Update usage count
            $sql = "UPDATE tags SET usage_count = usage_count + 1 WHERE id = ?";
            $this->db->execute($sql, [$tag['id']]);
            return $tag['id'];
        } else {
            // Create new tag
            $sql = "INSERT INTO tags (name, slug, usage_count) VALUES (?, ?, 1)";
            $this->db->execute($sql, [$tagName, $slug]);
            return $this->db->lastInsertId();
        }
    }

    /**
     * Generate URL-friendly slug
     */
    private function generateSlug($text)
    {
        $slug = strtolower(trim($text));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');
        return $slug;
    }

    /**
     * Generate excerpt from content
     */
    private function generateExcerpt($content, $length = 150)
    {
        $content = strip_tags($content);
        $content = preg_replace('/\s+/', ' ', $content);
        
        if (strlen($content) <= $length) {
            return $content;
        }
        
        return substr($content, 0, $length) . '...';
    }

    /**
     * Get total count of posts based on filters
     */
    public function getCount($filters = [])
    {
        $sql = "SELECT COUNT(DISTINCT p.id) as total FROM posts p";
        $joins = [];
        $conditions = [];
        $params = [];

        // Add joins and conditions based on filters
        if (!empty($filters['category'])) {
            $joins[] = "JOIN post_categories pc ON p.id = pc.post_id";
            $joins[] = "JOIN categories c ON pc.category_id = c.id";
            $conditions[] = "c.name = ?";
            $params[] = $filters['category'];
        }

        if (!empty($filters['tag'])) {
            $joins[] = "JOIN post_tags pt ON p.id = pt.post_id";
            $joins[] = "JOIN tags t ON pt.tag_id = t.id";
            $conditions[] = "t.name = ?";
            $params[] = $filters['tag'];
        }

        if (!empty($filters['author'])) {
            $conditions[] = "p.author_id = ?";
            $params[] = $filters['author'];
        }

        if (!empty($filters['status'])) {
            $conditions[] = "p.status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $conditions[] = "(p.title LIKE ? OR p.content LIKE ?)";
            $params[] = '%' . $filters['search'] . '%';
            $params[] = '%' . $filters['search'] . '%';
        }

        // Add joins to SQL
        if (!empty($joins)) {
            $sql .= " " . implode(" ", $joins);
        }

        // Add conditions
        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }

        $result = $this->db->fetch($sql, $params);
        return $result ? $result['total'] : 0;
    }

    /**
     * Increment view count
     */
    public function incrementViews($postId)
    {
        $sql = "UPDATE posts SET view_count = view_count + 1 WHERE id = ?";
        return $this->db->execute($sql, [$postId]);
    }

    /**
     * Set post categories
     */
    public function setCategories($postId, $categoryNames)
    {
        // Remove existing categories
        $sql = "DELETE FROM post_categories WHERE post_id = ?";
        $this->db->execute($sql, [$postId]);

        if (!empty($categoryNames)) {
            foreach ($categoryNames as $categoryName) {
                // Get or create category
                $categoryId = $this->getOrCreateCategory($categoryName);
                
                // Link post to category
                $sql = "INSERT IGNORE INTO post_categories (post_id, category_id) VALUES (?, ?)";
                $this->db->execute($sql, [$postId, $categoryId]);
            }
        }
    }

    /**
     * Set post tags
     */
    public function setTags($postId, $tagNames)
    {
        // Remove existing tags
        $sql = "DELETE FROM post_tags WHERE post_id = ?";
        $this->db->execute($sql, [$postId]);

        if (!empty($tagNames)) {
            foreach ($tagNames as $tagName) {
                // Get or create tag
                $tagId = $this->getOrCreateTag($tagName);
                
                // Link post to tag
                $sql = "INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)";
                $this->db->execute($sql, [$postId, $tagId]);
            }
        }
    }

    /**
     * Get all categories
     */
    public function getCategories()
    {
        $sql = "SELECT id, name, slug, description, color, post_count 
                FROM categories 
                WHERE status = 'active'
                ORDER BY name ASC";
        
        return $this->db->fetchAll($sql);
    }

    /**
     * Get or create category
     */
    private function getOrCreateCategory($categoryName)
    {
        $slug = $this->generateSlug($categoryName);
        
        // Check if category exists
        $sql = "SELECT id FROM categories WHERE slug = ?";
        $category = $this->db->fetch($sql, [$slug]);
        
        if ($category) {
            // Update post count
            $sql = "UPDATE categories SET post_count = post_count + 1 WHERE id = ?";
            $this->db->execute($sql, [$category['id']]);
            return $category['id'];
        } else {
            // Create new category
            $sql = "INSERT INTO categories (name, slug, post_count, status) VALUES (?, ?, 1, 'active')";
            $this->db->execute($sql, [$categoryName, $slug]);
            return $this->db->lastInsertId();
        }
    }

    /**
     * Get or create tag
     */
    private function getOrCreateTag($tagName)
    {
        $slug = $this->generateSlug($tagName);
        
        // Check if tag exists
        $sql = "SELECT id FROM tags WHERE slug = ?";
        $tag = $this->db->fetch($sql, [$slug]);
        
        if ($tag) {
            // Update usage count
            $sql = "UPDATE tags SET usage_count = usage_count + 1 WHERE id = ?";
            $this->db->execute($sql, [$tag['id']]);
            return $tag['id'];
        } else {
            // Create new tag
            $sql = "INSERT INTO tags (name, slug, usage_count) VALUES (?, ?, 1)";
            $this->db->execute($sql, [$tagName, $slug]);
            return $this->db->lastInsertId();
        }
    }
}
?>