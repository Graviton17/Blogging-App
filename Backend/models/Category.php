<?php
/**
 * Category Model
 * Handles category-related database operations
 */

require_once __DIR__ . '/Database.php';

class Category {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Get all categories with post counts
     */
    public function getAllWithPostCount() {
        $sql = "SELECT 
                    c.id,
                    c.name,
                    c.slug,
                    c.description,
                    c.created_at,
                    COUNT(p.id) as post_count
                FROM categories c
                LEFT JOIN post_categories pc ON c.id = pc.category_id
                LEFT JOIN posts p ON pc.post_id = p.id AND p.status = 'published'
                GROUP BY c.id, c.name, c.slug, c.description, c.created_at
                ORDER BY c.name ASC";
        
        return $this->db->fetchAll($sql);
    }
    
    /**
     * Get all categories
     */
    public function getAll() {
        $sql = "SELECT * FROM categories ORDER BY name ASC";
        return $this->db->fetchAll($sql);
    }
    
    /**
     * Get category by ID
     */
    public function findById($id) {
        $sql = "SELECT * FROM categories WHERE id = ?";
        return $this->db->fetch($sql, [$id]);
    }
    
    /**
     * Get category by slug
     */
    public function findBySlug($slug) {
        $sql = "SELECT * FROM categories WHERE slug = ?";
        return $this->db->fetch($sql, [$slug]);
    }
    
    /**
     * Create a new category
     */
    public function create($data) {
        $sql = "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)";
        
        $slug = $this->generateSlug($data['name']);
        
        $this->db->execute($sql, [
            $data['name'],
            $slug,
            $data['description'] ?? null
        ]);
        
        return $this->db->lastInsertId();
    }
    
    /**
     * Update category
     */
    public function update($id, $data) {
        $sql = "UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?";
        
        $slug = $this->generateSlug($data['name']);
        
        return $this->db->execute($sql, [
            $data['name'],
            $slug,
            $data['description'] ?? null,
            $id
        ]);
    }
    
    /**
     * Delete category
     */
    public function delete($id) {
        // First remove all post associations
        $sql = "DELETE FROM post_categories WHERE category_id = ?";
        $this->db->execute($sql, [$id]);
        
        // Then delete the category
        $sql = "DELETE FROM categories WHERE id = ?";
        return $this->db->execute($sql, [$id]);
    }
    
    /**
     * Generate URL-friendly slug from name
     */
    private function generateSlug($name) {
        $slug = strtolower($name);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        $slug = trim($slug, '-');
        
        // Ensure uniqueness
        $originalSlug = $slug;
        $counter = 1;
        
        while ($this->slugExists($slug)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }
    
    /**
     * Check if slug exists
     */
    private function slugExists($slug) {
        $sql = "SELECT id FROM categories WHERE slug = ?";
        $result = $this->db->fetch($sql, [$slug]);
        
        return $result !== false;
    }
}
?>
