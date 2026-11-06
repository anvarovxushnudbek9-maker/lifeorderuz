CREATE OR REPLACE FUNCTION public.circle_leaderboard(_circle uuid)
RETURNS TABLE(display_name text, points integer, is_me boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(nullif(split_part(p.full_name,' ',1),''),'A''zo'),
    ((SELECT count(*) FROM public.habit_logs l WHERE l.user_id = m.user_id AND l.log_date >= current_date - 6)
     + 2 * (SELECT count(*) FROM public.top_tasks t WHERE t.user_id = m.user_id AND t.done AND t.task_date >= current_date - 6))::int,
    m.user_id = auth.uid()
  FROM public.circle_members m LEFT JOIN public.profiles p ON p.id = m.user_id
  WHERE m.circle_id = _circle AND private.is_circle_member(_circle, auth.uid())
  ORDER BY 2 DESC LIMIT 20;
$$;
REVOKE ALL ON FUNCTION public.circle_leaderboard(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.circle_leaderboard(uuid) TO authenticated;