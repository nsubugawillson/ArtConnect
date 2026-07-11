
-- Drop the blanket UNIQUE constraint on phone — empty/null phones are not unique identifiers.
-- Replace with a partial unique index that only enforces uniqueness for non-empty phone values.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_nonempty_unique
  ON public.profiles (phone)
  WHERE phone IS NOT NULL AND phone <> '';

-- Update the trigger to insert NULL instead of empty string for phone,
-- so the partial unique index never conflicts.
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
  v_phone := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), '');

  INSERT INTO public.profiles (id, phone, name, role, avatar_url)
  VALUES (NEW.id, v_phone, v_name, v_role, null)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.wallets (user_id, available_balance, locked_balance, currency)
  VALUES (NEW.id, 10000000, 0, 'UGX')
  ON CONFLICT (user_id) DO NOTHING;

  IF v_role = 'designer' THEN
    INSERT INTO public.designer_profiles (user_id, bio, specializations, is_vetted, rating, completed_projects, hourly_rate, location, years_experience)
    VALUES (NEW.id, '', '{}', false, 0, 0, 0, '', 0)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
