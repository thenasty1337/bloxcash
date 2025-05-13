-- Add mutedUntil column to users table
ALTER TABLE users ADD COLUMN mutedUntil TIMESTAMP NULL COMMENT 'Timestamp when user''s chat mute expires' AFTER country;

-- Verify the column was added
DESCRIBE users mutedUntil; 