CREATE OR REPLACE FUNCTION public.accept_buddy(_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE other uuid; me uuid := auth.uid();
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT user_id INTO other FROM public.buddy_links WHERE invite_code = _code AND partner_id IS NULL;
  IF other IS NULL OR other = me THEN RETURN false; END IF;
  UPDATE public.buddy_links SET partner_id = me WHERE user_id = other;
  INSERT INTO public.buddy_links(user_id, invite_code, partner_id)
    VALUES (me, replace(gen_random_uuid()::text,'-',''), other)
    ON CONFLICT (user_id) DO UPDATE SET partner_id = other;
  RETURN true;
END $$;