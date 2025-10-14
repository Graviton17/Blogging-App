-- 011_create_remember_tokens_table.sql
-- Create remember_tokens table for "Remember Me" functionality

CREATE TABLE remember_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_remember_tokens_user_id ON remember_tokens(user_id);
CREATE INDEX idx_remember_tokens_token ON remember_tokens(token);
CREATE INDEX idx_remember_tokens_expires_at ON remember_tokens(expires_at);