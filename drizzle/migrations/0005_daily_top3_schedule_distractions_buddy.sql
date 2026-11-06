CREATE TABLE public.top_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_date date NOT NULL DEFAULT current_date,
  position smallint NOT NULL CHECK (position BETWEEN 1 AND 3),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_date, position)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.top_tasks TO authenticated;
GRANT ALL ON public.top_tasks TO service_role;
ALTER TABLE public.top_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own top tasks" ON public.top_tasks FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.schedule_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  block_date date NOT NULL DEFAULT current_date,
  hour smallint NOT NULL CHECK (hour BETWEEN 0 AND 23),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, block_date, hour)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_blocks TO authenticated;
GRANT ALL ON public.schedule_blocks TO service_role;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own schedule" ON public.schedule_blocks FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.distraction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  logged_on date NOT NULL DEFAULT current_date,
  source text NOT NULL CHECK (char_length(source) BETWEEN 1 AND 60),
  minutes integer NOT NULL CHECK (minutes BETWEEN 1 AND 1440),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.distraction_logs TO authenticated;
GRANT ALL ON public.distraction_logs TO service_role;
ALTER TABLE public.distraction_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own distractions" ON public.distraction_logs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.buddy_links (
  user_id uuid PRIMARY KEY,
  invite_code text NOT NULL UNIQUE,
  partner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buddy_links TO authenticated;
GRANT ALL ON public.buddy_links TO service_role;
ALTER TABLE public.buddy_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own buddy select" ON public.buddy_links FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own buddy insert" ON public.buddy_links FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND partner_id IS NULL);
CREATE POLICY "own buddy delete" ON public.buddy_links FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.body_metrics ADD COLUMN IF NOT EXISTS sleep_quality smallint CHECK (sleep_quality BETWEEN 1 AND 5);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coach_mode text NOT NULL DEFAULT 'normal' CHECK (coach_mode IN ('normal','hardcore'));

CREATE OR REPLACE FUNCTION public.accept_buddy(_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE other uuid; me uuid := auth.uid();
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT user_id INTO other FROM public.buddy_links WHERE invite_code = _code AND partner_id IS NULL;
  IF other IS NULL OR other = me THEN RETURN false; END IF;
  UPDATE public.buddy_links SET partner_id = me WHERE user_id = other;
  INSERT INTO public.buddy_links(user_id, invite_code, partner_id)
    VALUES (me, encode(gen_random_bytes(9),'hex'), other)
    ON CONFLICT (user_id) DO UPDATE SET partner_id = other;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.accept_buddy(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.accept_buddy(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.buddy_today()
RETURNS TABLE(partner_name text, done integer, total integer) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(split_part(p.full_name,' ',1),'Hamkor'),
    (SELECT count(*)::int FROM public.top_tasks t WHERE t.user_id = b.partner_id AND t.task_date = current_date AND t.done),
    (SELECT count(*)::int FROM public.top_tasks t WHERE t.user_id = b.partner_id AND t.task_date = current_date)
  FROM public.buddy_links b
  JOIN public.buddy_links back ON back.user_id = b.partner_id AND back.partner_id = b.user_id
  LEFT JOIN public.profiles p ON p.id = b.partner_id
  WHERE b.user_id = auth.uid();
$$;
REVOKE ALL ON FUNCTION public.buddy_today() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.buddy_today() TO authenticated;