-- Add username column to profiles table for login credentials
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Enable RLS policy for username-based lookups (already covered by existing policies)