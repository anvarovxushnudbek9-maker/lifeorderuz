CREATE TABLE public.telegram_links (
  user_id uuid PRIMARY KEY,
  chat_id bigint UNIQUE,
  link_code text UNIQUE,
  code_expires_at timestamptz,
  timezone text NOT NULL DEFAULT 'Asia/Tashkent',
  linked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT telegram_links_code_chk CHECK (link_code IS NULL OR link_code ~ '^[A-Za-z0-9_-]{16,64}$'),
  CONSTRAINT telegram_links_tz_chk CHECK (char_length(timezone) BETWEEN 1 AND 64)
);
GRANT SELECT, DELETE ON public.telegram_links TO authenticated;
GRANT INSERT (user_id, link_code, code_expires_at, timezone) ON public.telegram_links TO authenticated;
GRANT UPDATE (link_code, code_expires_at, timezone) ON public.telegram_links TO authenticated;
GRANT ALL ON public.telegram_links TO service_role;
ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY telegram_links_select_own ON public.telegram_links FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY telegram_links_insert_own ON public.telegram_links FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY telegram_links_update_own ON public.telegram_links FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY telegram_links_delete_own ON public.telegram_links FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.reminder_deliveries (
  reminder_id uuid NOT NULL REFERENCES public.reminders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  local_date date NOT NULL,
  channel text NOT NULL DEFAULT 'telegram',
  sent_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (reminder_id, local_date, channel)
);
GRANT SELECT ON public.reminder_deliveries TO authenticated;
GRANT ALL ON public.reminder_deliveries TO service_role;
ALTER TABLE public.reminder_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY reminder_deliveries_select_own ON public.reminder_deliveries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX reminder_deliveries_user_day_idx ON public.reminder_deliveries(user_id, local_date);