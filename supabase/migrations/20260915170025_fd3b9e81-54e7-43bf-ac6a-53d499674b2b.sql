ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS goal_type text,
  ADD COLUMN IF NOT EXISTS sport_preference text;