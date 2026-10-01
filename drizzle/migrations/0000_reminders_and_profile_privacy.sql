DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  note text CHECK (note IS NULL OR char_length(note) <= 1000),
  remind_date date NOT NULL DEFAULT current_date,
  start_time time NOT NULL,
  end_time time,
  repeat text NOT NULL DEFAULT 'none' CHECK (repeat IN ('none','daily','weekdays')),
  done_on date[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminders TO authenticated;
GRANT ALL ON public.reminders TO service_role;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY reminders_own_all ON public.reminders FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX reminders_user_idx ON public.reminders(user_id, remind_date);