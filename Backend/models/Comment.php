<?php
require_once __DIR__ . '/Database.php';

/**
 * Comment model for handling blog post comments
 */
class Comment
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Create a new comment
     */
    public function create($commentData)
    {
        // Validate required fields
        if (!isset($commentData['post_id']) || !isset($commentData['content'])) {
            throw new Exception("Missing required fields");
        }

        $sql = "INSERT INTO comments (post_id, user_id, parent_id, author_name, author_email, content, status, ip_address, user_agent) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $params = [
            $commentData['post_id'],
            $commentData['user_id'] ?? null,
            $commentData['parent_id'] ?? null,
            $commentData['author_name'] ?? null,
            $commentData['author_email'] ?? null,
            $commentData['content'],
            $commentData['status'] ?? 'pending',
            $commentData['ip_address'] ?? $_SERVER['REMOTE_ADDR'] ?? null,
            $commentData['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? null
        ];

        try {
            $this->db->beginTransaction();
            
            $this->db->execute($sql, $params);
            $commentId = $this->db->lastInsertId();
            
            // Update post comment count
            $this->updatePostCommentCount($commentData['post_id']);
            
            $this->db->commit();
            
            return $commentId;
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * Get comments for a post with threaded structure
     */
    public function getByPost($postId, $page = 1, $limit = COMMENTS_PER_PAGE)
    {
        $offset = ($page - 1) * $limit;
        
        // Get top-level comments first
        $sql = "SELECT c.*, u.username, u.first_name, u.last_name
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE c.post_id = ? AND c.parent_id IS NULL AND c.status = 'approved'
                ORDER BY c.created_at DESC
                LIMIT ? OFFSET ?";
        
        $comments = $this->db->fetchAll($sql, [$postId, $limit, $offset]);
        
        // Format comment data with proper field names
        foreach ($comments as &$comment) {
            // Create user_name from available data (guest or registered user)
            if ($comment['user_id']) {
                // Registered user - combine first and last name or use username
                $fullName = trim(($comment['first_name'] ?? '') . ' ' . ($comment['last_name'] ?? ''));
                $comment['user_name'] = $fullName ?: ($comment['username'] ?? 'Anonymous');
            } else {
                // Guest comment - use author_name
                $comment['user_name'] = $comment['author_name'] ?? 'Anonymous';
            }
            
            // Get replies for each comment
            $comment['replies'] = $this->getReplies($comment['id']);
        }
        
        return $comments;
    }

    /**
     * Get replies for a comment
     */
    private function getReplies($parentId)
    {
        $sql = "SELECT c.*, u.username, u.first_name, u.last_name
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE c.parent_id = ? AND c.status = 'approved'
                ORDER BY c.created_at ASC";
        
        $replies = $this->db->fetchAll($sql, [$parentId]);
        
        // Format reply data with proper field names
        foreach ($replies as &$reply) {
            // Create user_name from available data (guest or registered user)
            if ($reply['user_id']) {
                // Registered user - combine first and last name or use username
                $fullName = trim(($reply['first_name'] ?? '') . ' ' . ($reply['last_name'] ?? ''));
                $reply['user_name'] = $fullName ?: ($reply['username'] ?? 'Anonymous');
            } else {
                // Guest comment - use author_name
                $reply['user_name'] = $reply['author_name'] ?? 'Anonymous';
            }
        }
        
        return $replies;
    }

    /**
     * Find comment by ID
     */
    public function findById($id)
    {
        $sql = "SELECT c.*, u.username, u.first_name, u.last_name
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.id
                WHERE c.id = ?";
        
        return $this->db->fetch($sql, [$id]);
    }

    /**
     * Update comment
     */
    public function update($id, $commentData)
    {
        $allowedFields = ['content', 'status'];
        $updateFields = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (isset($commentData[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $commentData[$field];
            }
        }

        if (empty($updateFields)) {
            throw new Exception("No valid fields to update");
        }

        $params[] = $id;
        $sql = "UPDATE comments SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = ?";
        
        $result = $this->db->execute($sql, $params);
        
        // Update post comment count if status changed
        if (isset($commentData['status'])) {
            $comment = $this->findById($id);
            if ($comment) {
                $this->updatePostCommentCount($comment['post_id']);
            }
        }
        
        return $result;
    }

    /**
     * Delete comment and its replies
     */
    public function delete($id)
    {
        $comment = $this->findById($id);
        if (!$comment) {
            throw new Exception("Comment not found");
        }

        try {
            $this->db->beginTransaction();
            
            // Delete replies first (CASCADE will handle this, but let's be explicit)
            $this->deleteReplies($id);
            
            // Delete the comment
            $sql = "DELETE FROM comments WHERE id = ?";
            $this->db->execute($sql, [$id]);
            
            // Update post comment count
            $this->updatePostCommentCount($comment['post_id']);
            
            $this->db->commit();
            
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * Delete replies recursively
     */
    private function deleteReplies($parentId)
    {
        $sql = "SELECT id FROM comments WHERE parent_id = ?";
        $replies = $this->db->fetchAll($sql, [$parentId]);
        
        foreach ($replies as $reply) {
            $this->deleteReplies($reply['id']);
        }
        
        $sql = "DELETE FROM comments WHERE parent_id = ?";
        $this->db->execute($sql, [$parentId]);
    }

    /**
     * Approve comment
     */
    public function approve($id)
    {
        return $this->update($id, ['status' => 'approved']);
    }

    /**
     * Reject comment
     */
    public function reject($id)
    {
        return $this->update($id, ['status' => 'trash']);
    }

    /**
     * Mark comment as spam
     */
    public function markAsSpam($id)
    {
        return $this->update($id, ['status' => 'spam']);
    }

    /**
     * Get pending comments for moderation
     */
    public function getPendingComments($page = 1, $limit = 20)
    {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT c.*, u.username, u.first_name, u.last_name, p.title as post_title
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.id
                JOIN posts p ON c.post_id = p.id
                WHERE c.status = 'pending'
                ORDER BY c.created_at DESC
                LIMIT ? OFFSET ?";
        
        return $this->db->fetchAll($sql, [$limit, $offset]);
    }

    /**
     * Get comment statistics
     */
    public function getStats()
    {
        $sql = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'spam' THEN 1 ELSE 0 END) as spam,
                    SUM(CASE WHEN status = 'trash' THEN 1 ELSE 0 END) as trash
                FROM comments";
        
        return $this->db->fetch($sql);
    }

    /**
     * Update post comment count
     */
    private function updatePostCommentCount($postId)
    {
        $sql = "UPDATE posts SET comment_count = (
                    SELECT COUNT(*) FROM comments 
                    WHERE post_id = ? AND status = 'approved'
                ) WHERE id = ?";
        
        return $this->db->execute($sql, [$postId, $postId]);
    }

    /**
     * Check if user can edit comment
     */
    public function canUserEdit($commentId, $userId)
    {
        $sql = "SELECT user_id FROM comments WHERE id = ?";
        $comment = $this->db->fetch($sql, [$commentId]);
        
        return $comment && $comment['user_id'] == $userId;
    }
}
?>