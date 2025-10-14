-- 005_create_post_categories_table.sql
-- Many-to-many relationship between posts and categories

CREATE TABLE post_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_category (post_id, category_id)
);