import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { levelFor, levelTitle, totalXp } from "@/lib/gamification";
import { Progress } from "@/components/ui/progress";

export function ProgressSummary({ uid }: { uid: string }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["progress-summary", uid], enabled: Boolean(uid), staleTime: 60_000,
    queryFn: async () => {
      const results = await Promise.all([
        supabase.from("habit_logs").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("top_tasks").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("done", true),
        supabase.from("workouts").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("books").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("distraction_logs").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("breach", true).is("recovered_at", null),
      ]);
      for (const result of results) if (result.error) throw result.error;
      return totalXp({ logs: results[0]?.count ?? 0, tasks: results[1]?.count ?? 0, workouts: results[2]?.count ?? 0, journal: results[3]?.count ?? 0, books: results[4]?.count ?? 0, breaches: results[5]?.count ?? 0 });
    },
  });
  const level = levelFor(data ?? 0);
  return <section className="mb-5 border-b border-border pb-5" aria-label="Shaxsiy rivojlanish">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link to="/yutuqlar" className="flex items-center gap-3"><Trophy className="size-5 text-primary" /><span><span className="block text-sm font-semibold">{levelTitle(level.level)}</span><span className="text-xs text-muted-foreground">{isError ? "Ballarni yuklab bo‘lmadi" : isPending ? "Yuklanmoqda…" : `${level.level}-daraja · ${data} XP`}</span></span></Link>
      {!isPending && !isError && <p className="text-xs text-muted-foreground">Keyingi darajagacha {level.need - level.into} XP</p>}
    </div>
    <Progress value={(level.into / level.need) * 100} className="mt-3" />
  </section>;
}