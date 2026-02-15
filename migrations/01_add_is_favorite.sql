-- Add is_favorite column to friendships table
ALTER TABLE friendships
ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
