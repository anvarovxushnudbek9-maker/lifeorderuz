CREATE TABLE public.daily_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_date date NOT NULL DEFAULT CURRENT_DATE,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  why text CHECK (char_length(why) <= 400),
  domain text NOT NULL DEFAULT 'umumiy' CHECK (char_length(domain) <= 40),
  minutes integer NOT NULL DEFAULT 15 CHECK (minutes BETWEEN 1 AND 240),
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','done','skipped','postponed')),
  skip_reason text CHECK (char_length(skip_reason) <= 60),
  source text NOT NULL DEFAULT 'engine' CHECK (source IN ('engine','user','carry')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, plan_date, title)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_plan_items TO authenticated;
GRANT ALL ON public.daily_plan_items TO service_role;
ALTER TABLE public.daily_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_plan_items_own ON public.daily_plan_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX daily_plan_items_user_date ON public.daily_plan_items (user_id, plan_date DESC);