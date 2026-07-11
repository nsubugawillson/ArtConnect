-- Create a function to get a user's email by username (for login)
-- This is needed because we can only query auth.users via admin or through metadata

-- Option 1: Store email in profiles table as well
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Option 2: Create a function that returns email from auth.users for username lookup
CREATE OR REPLACE FUNCTION get_email_by_username(p_username text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.email 
  FROM auth.users au 
  JOIN public.profiles p ON p.id = au.id 
  WHERE p.username = p_username;
$$;

-- Also create a function to get email by profile ID
CREATE OR REPLACE FUNCTION get_email_by_profile_id(p_profile_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = p_profile_id;
$$;