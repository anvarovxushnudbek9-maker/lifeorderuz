CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_circle_member(_circle uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = _circle AND user_id = _user);
$$;
REVOKE ALL ON FUNCTION private.is_circle_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_circle_member(uuid, uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS members_select ON public.circle_members;
CREATE POLICY members_select ON public.circle_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.is_circle_member(circle_id, auth.uid()));

DROP POLICY IF EXISTS messages_read ON public.circle_messages;
CREATE POLICY messages_read ON public.circle_messages FOR SELECT TO authenticated
  USING (private.is_circle_member(circle_id, auth.uid()));

DROP POLICY IF EXISTS messages_write ON public.circle_messages;
CREATE POLICY messages_write ON public.circle_messages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND private.is_circle_member(circle_id, auth.uid()));

DROP POLICY IF EXISTS circles_visible ON public.circles;
CREATE POLICY circles_visible ON public.circles FOR SELECT TO authenticated
  USING (is_public OR created_by = auth.uid() OR private.is_circle_member(id, auth.uid()));

COMMENT ON FUNCTION public.is_circle_member(uuid, uuid) IS 'DEPRECATED: replaced by private.is_circle_member';
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS members_join ON public.circle_members;
CREATE POLICY members_join ON public.circle_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.circles c WHERE c.id = circle_id AND (c.is_public OR c.created_by = auth.uid())));

ALTER TABLE public.profiles ADD CONSTRAINT profiles_age_chk CHECK (age IS NULL OR age BETWEEN 10 AND 110) NOT VALID;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_height_chk CHECK (height_cm IS NULL OR height_cm BETWEEN 80 AND 260) NOT VALID;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_weight_chk CHECK (weight_kg IS NULL OR weight_kg BETWEEN 20 AND 400) NOT VALID;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_text_len_chk CHECK (char_length(coalesce(full_name,'')) <= 100 AND char_length(coalesce(bio,'')) <= 1000 AND char_length(coalesce(main_goal,'')) <= 500) NOT VALID;
ALTER TABLE public.habits ADD CONSTRAINT habits_title_chk CHECK (char_length(title) BETWEEN 1 AND 120 AND target_per_week BETWEEN 1 AND 7) NOT VALID;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_len_chk CHECK (char_length(content) <= 20000 AND (mood IS NULL OR mood BETWEEN 1 AND 5)) NOT VALID;
ALTER TABLE public.meals ADD CONSTRAINT meals_vals_chk CHECK (char_length(title) <= 120 AND kcal BETWEEN 0 AND 10000 AND protein_g BETWEEN 0 AND 1000) NOT VALID;
ALTER TABLE public.workouts ADD CONSTRAINT workouts_vals_chk CHECK (char_length(title) <= 120 AND duration_min BETWEEN 1 AND 1440) NOT VALID;
ALTER TABLE public.body_metrics ADD CONSTRAINT body_vals_chk CHECK (water_ml BETWEEN 0 AND 20000 AND steps BETWEEN 0 AND 200000 AND (sleep_hours IS NULL OR sleep_hours BETWEEN 0 AND 24)) NOT VALID;
ALTER TABLE public.books ADD CONSTRAINT books_vals_chk CHECK (char_length(title) <= 200 AND total_pages >= 0 AND current_page >= 0) NOT VALID;
ALTER TABLE public.courses ADD CONSTRAINT courses_vals_chk CHECK (char_length(title) <= 200 AND progress BETWEEN 0 AND 100) NOT VALID;
ALTER TABLE public.circles ADD CONSTRAINT circles_vals_chk CHECK (char_length(name) BETWEEN 1 AND 80 AND char_length(coalesce(description,'')) <= 500) NOT VALID;
ALTER TABLE public.circle_messages ADD CONSTRAINT circle_msg_len_chk CHECK (char_length(content) BETWEEN 1 AND 2000) NOT VALID;
ALTER TABLE public.ai_messages ADD CONSTRAINT ai_msg_chk CHECK (role IN ('user','assistant') AND char_length(content) <= 8000) NOT VALID;

CREATE INDEX IF NOT EXISTS habits_user_idx ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS habit_logs_user_date_idx ON public.habit_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS meals_user_date_idx ON public.meals(user_id, eaten_on);
CREATE INDEX IF NOT EXISTS workouts_user_date_idx ON public.workouts(user_id, performed_on);
CREATE INDEX IF NOT EXISTS body_user_date_idx ON public.body_metrics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS journal_user_date_idx ON public.journal_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS books_user_idx ON public.books(user_id);
CREATE INDEX IF NOT EXISTS courses_user_idx ON public.courses(user_id);
CREATE INDEX IF NOT EXISTS ai_messages_user_idx ON public.ai_messages(user_id, created_at);
CREATE INDEX IF NOT EXISTS circle_messages_circle_idx ON public.circle_messages(circle_id, created_at);
CREATE INDEX IF NOT EXISTS circle_members_user_idx ON public.circle_members(user_id);