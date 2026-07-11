-- Create or replace the handle_new_user trigger to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, phone, name, role, avatar_url, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NEW.raw_user_meta_data->>'username',
    NEW.email
  );

  -- Insert wallet with starter balance
  INSERT INTO public.wallets (user_id, available_balance, locked_balance, currency)
  VALUES (NEW.id, 500000, 0, 'UGX');

  -- If designer, insert designer profile
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'client') = 'designer' THEN
    INSERT INTO public.designer_profiles (user_id, bio, specializations, is_vetted, rating, completed_projects, hourly_rate, location, years_experience)
    VALUES (
      NEW.id,
      '',
      ARRAY[]::text[],
      false,
      0,
      0,
      0,
      'Kampala, Uganda',
      0
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Also update email on existing profiles when they log in (via trigger on auth.users update)
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET email = NEW.email
  WHERE id = NEW.id AND email IS DISTINCT FROM NEW.email;
  RETURN NEW;
END;
$$;

-- Trigger to sync email on login/token refresh
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_email();