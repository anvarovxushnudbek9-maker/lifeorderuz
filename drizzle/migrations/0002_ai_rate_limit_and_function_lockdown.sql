ALTER FUNCTION public.is_circle_member(uuid, uuid) SECURITY INVOKER;

CREATE TABLE public.ai_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ai_requests TO authenticated;
GRANT ALL ON public.ai_requests TO service_role;
ALTER TABLE public.ai_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_requests_select_own ON public.ai_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY ai_requests_insert_own ON public.ai_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX ai_requests_user_time_idx ON public.ai_requests(user_id, created_at DESC);

ALTER TABLE public.reminders ADD CONSTRAINT reminders_done_on_len_chk CHECK (cardinality(done_on) <= 400) NOT VALID;