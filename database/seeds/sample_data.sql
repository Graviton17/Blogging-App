-- Default Categories
INSERT INTO categories (name, slug, description, color, status) VALUES
('Technology', 'technology', 'Posts about technology and programming', '#007bff', 'active'),
('Lifestyle', 'lifestyle', 'Personal and lifestyle content', '#28a745', 'active'),
('Travel', 'travel', 'Travel experiences and guides', '#ffc107', 'active'),
('Food', 'food', 'Recipes and food reviews', '#dc3545', 'active'),
('Business', 'business', 'Business and entrepreneurship', '#6f42c1', 'active'),
('Health', 'health', 'Health and wellness topics', '#20c997', 'active');

-- Sample Admin User (password: admin123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, email_verified, is_active) VALUES
('admin', 'admin@blogapp.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', TRUE, TRUE);

-- Create profile for admin user
INSERT INTO profiles (user_id, bio, location) VALUES
(1, 'Welcome to our blogging platform! I\'m the administrator of this site.', 'Digital World');

-- Sample Author User (password: author123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, email_verified, is_active) VALUES
('johndoe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'author', TRUE, TRUE);

-- Create profile for sample author
INSERT INTO profiles (user_id, bio, website_url, location) VALUES
(2, 'Tech enthusiast and blogger. I love writing about web development and emerging technologies.', 'https://johndoe.com', 'San Francisco, CA');

-- Sample Tags
INSERT INTO tags (name, slug, usage_count) VALUES
('PHP', 'php', 5),
('JavaScript', 'javascript', 8),
('Web Development', 'web-development', 12),
('Tutorial', 'tutorial', 15),
('Beginner', 'beginner', 10),
('Advanced', 'advanced', 6),
('HTML', 'html', 7),
('CSS', 'css', 9);

-- Sample Blog Post
INSERT INTO posts (title, slug, content, excerpt, author_id, status, visibility, view_count, like_count, published_at) VALUES
('Welcome to Our Blogging Platform', 'welcome-to-our-blogging-platform', 
'<h2>Welcome to Our Amazing Blogging Platform!</h2>
<p>We\'re excited to have you join our community of writers and readers. This platform is designed to make blogging simple, enjoyable, and engaging for everyone.</p>
<h3>What You Can Do Here:</h3>
<ul>
<li>Create and publish your own blog posts</li>
<li>Discover interesting content from other writers</li>
<li>Engage with the community through comments</li>
<li>Organize your posts with categories and tags</li>
<li>Customize your profile and showcase your personality</li>
</ul>
<p>Whether you\'re a seasoned blogger or just getting started, our platform provides all the tools you need to share your thoughts, experiences, and expertise with the world.</p>
<p>Happy blogging!</p>', 
'Welcome to our blogging platform! Discover what you can do here and start your blogging journey today.', 
1, 'published', 'public', 42, 5, NOW());

-- Link the post to categories
INSERT INTO post_categories (post_id, category_id) VALUES (1, 1); -- Technology

-- Link the post to tags
INSERT INTO post_tags (post_id, tag_id) VALUES 
(1, 4), -- Tutorial
(1, 5); -- Beginner

-- Sample Comment
INSERT INTO comments (post_id, user_id, author_name, author_email, content, status) VALUES
(1, 2, 'John Doe', 'john@example.com', 'Great platform! Looking forward to sharing my content here.', 'approved');

-- Update comment count for the post
UPDATE posts SET comment_count = 1 WHERE id = 1;