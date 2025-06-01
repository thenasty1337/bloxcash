-- Update any existing user_settings rows that have NULL session_timeout to default 30 days
UPDATE user_settings 
SET session_timeout = 43200 
WHERE session_timeout IS NULL;

-- Also update any users who might have the old default of 30 minutes to 30 days
UPDATE user_settings 
SET session_timeout = 43200 
WHERE session_timeout = 30; 