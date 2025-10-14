-- Add allow_comments column to posts table
-- This allows posts to disable comments if needed

ALTER TABLE posts 
ADD COLUMN allow_comments TINYINT(1) DEFAULT 1 AFTER comment_count;

-- Update existing posts to allow comments by default
UPDATE posts SET allow_comments = 1 WHERE allow_comments IS NULL;
