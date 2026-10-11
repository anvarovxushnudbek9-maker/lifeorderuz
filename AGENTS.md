<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- `/api/chat` requires a Supabase bearer token and enforces per-user hourly/daily limits via `public.ai_requests`; call it only through `src/lib/ai-fetch.ts`. Why: an open AI endpoint lets anyone burn the project's AI credits.
- RLS helper functions live in the `private` schema (not exposed by the Data API). Why: keeps SECURITY DEFINER helpers off the public API.
- Daily plan ("Life Engine") is computed by deterministic rules in `src/lib/life-engine.ts` and stored in `public.daily_plan_items`. Why: the core loop must work without AI.
- `/api/chat` builds the user's context server-side from the database and ignores client-sent context. Why: AI advice must rest on verified data.
