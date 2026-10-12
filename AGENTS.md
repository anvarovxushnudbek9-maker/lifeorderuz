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
- New database changes use Lovable's Drizzle migration tool; retain historical Supabase files without replaying or squashing applied migrations. Why: preserves production data and migration identity.
- Offline app-shell registration lives only in src/lib/pwa.ts; cache public landing and versioned assets, never authenticated HTML, API responses or user records. Why: avoids stale previews and cross-account disclosure.
- Focus timing uses an absolute deadline; completing a timer never automatically marks a task done. Why: elapsed time is not evidence of execution.
- Evening reviews are journal entries with mood, not a second duplicate store. Why: one owner-scoped source for reflection.
- `/api/chat` requires a Supabase bearer token and enforces per-user hourly/daily limits via `public.ai_requests`; call it only through `src/lib/ai-fetch.ts`. Why: an open AI endpoint lets anyone burn the project's AI credits.
- RLS helper functions live in the `private` schema (not exposed by the Data API). Why: keeps SECURITY DEFINER helpers off the public API.
- Daily plan ("Life Engine") is computed by deterministic rules in `src/lib/life-engine.ts` and stored in `public.daily_plan_items`. Why: the core loop must work without AI.
- `/api/chat` builds the user's context server-side from the database and ignores client-sent context. Why: AI advice must rest on verified data.
