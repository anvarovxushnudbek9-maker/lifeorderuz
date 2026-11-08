CREATE TABLE public.daily_checkins (
  user_id uuid NOT NULL,
  checkin_date date NOT NULL DEFAULT current_date,
  energy smallint CHECK (energy BETWEEN 1 AND 3),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, checkin_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_checkins TO authenticated;
GRANT ALL ON public.daily_checkins TO service_role;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own checkins" ON public.daily_checkins FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE public.distraction_logs ADD COLUMN IF NOT EXISTS breach boolean NOT NULL DEFAULT false;
ALTER TABLE public.distraction_logs ADD COLUMN IF NOT EXISTS recovery text CHECK (char_length(recovery) <= 80);
ALTER TABLE public.distraction_logs ADD COLUMN IF NOT EXISTS recovered_at timestamptz;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS archetype text CHECK (archetype IN ('developer','leader','student'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dopamine_triggers text[] NOT NULL DEFAULT '{}' CHECK (coalesce(array_length(dopamine_triggers, 1), 0) <= 2);