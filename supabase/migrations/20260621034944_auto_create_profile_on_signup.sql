
-- Trigger function: runs as SECURITY DEFINER (superuser) so it bypasses RLS
-- and can INSERT into profiles, wallets, and designer_profiles immediately
-- when a new user is created in auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role  text;
  v_name  text;
  v_phone text;
BEGIN
  v_role  := COALESCE(NEW.raw_user_meta_data->>'role',  'client');
  v_name  := COALESCE(NEW.raw_user_meta_data->>'name',  'User');
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

  -- 1. Create profile
  INSERT INTO public.profiles (id, phone, name, role, avatar_url)
  VALUES (NEW.id, v_phone, v_name, v_role, null)
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create wallet with starter balance
  INSERT INTO public.wallets (user_id, available_balance, locked_balance, currency)
  VALUES (NEW.id, 10000000, 0, 'UGX')
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. Create designer_profile if role is designer
  IF v_role = 'designer' THEN
    INSERT INTO public.designer_profiles (user_id, bio, specializations, is_vetted, rating, completed_projects, hourly_rate, location, years_experience)
    VALUES (NEW.id, '', '{}', false, 0, 0, 0, '', 0)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop old trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
