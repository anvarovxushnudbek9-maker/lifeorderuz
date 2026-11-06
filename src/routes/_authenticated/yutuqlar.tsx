import { levelFor, levelTitle, totalXp } from "@/lib/gamification";
import { Progress } from "@/components/ui/progress";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Lock } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const TITLE = "Yutuqlar — Life Order";
const DESC = "Faolligingiz asosida ochiladigan nishonlar va bosqichlar.";

export const Route = createFileRoute("/_authenticated/yutuqlar")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Achievements,
});

function Achievements() {
  const { user } = useAuth();
  const uid = user?.id ?? "";

  const { data } = useQuery({
    queryKey: ["achievements", uid],
    enabled: !!uid,
    queryFn: async () => {
      const [logs, workouts, books, journal, members, tasks] = await Promise.all([
        supabase.from("habit_logs").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("workouts").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("books").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase
          .from("journal_entries")
          .select("id", { count: "exact", head: true })
          .eq("user_id", uid),
        supabase
          .from("circle_members")
          .select("circle_id", { count: "exact", head: true })
          .eq("user_id", uid),
        supabase.from("top_tasks").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("done", true),
      ]);
      return {
        logs: logs.count ?? 0,
        workouts: workouts.count ?? 0,
        books: books.count ?? 0,
        journal: journal.count ?? 0,
        circles: members.count ?? 0,
        tasks: tasks.count ?? 0,
      };
    },
  });

  const badges = [
    { title: "Birinchi qadam", desc: "Birinchi odatni belgilang", got: (data?.logs ?? 0) >= 1 },
    { title: "Doimiylik", desc: "50 ta odat belgisi", got: (data?.logs ?? 0) >= 50 },
    { title: "Temir iroda", desc: "200 ta odat belgisi", got: (data?.logs ?? 0) >= 200 },
    { title: "Harakatdagi tana", desc: "10 ta mashq yozuvi", got: (data?.workouts ?? 0) >= 10 },
    { title: "Kitobxon", desc: "5 ta kitob qo'shish", got: (data?.books ?? 0) >= 5 },
    { title: "Ichki suhbat", desc: "20 ta kundalik yozuv", got: (data?.journal ?? 0) >= 20 },
    { title: "Uch g'alaba", desc: "3 ta asosiy ishni bajarish", got: (data?.tasks ?? 0) >= 3 },
    { title: "Fokus ustasi", desc: "30 ta asosiy ishni bajarish", got: (data?.tasks ?? 0) >= 30 },
    { title: "Davra a'zosi", desc: "Bitta davraga qo'shiling", got: (data?.circles ?? 0) >= 1 },
  ];

  const xp = data ? totalXp(data) : 0;
  const lv = levelFor(xp);
  const unlocked = badges.filter((b) => b.got).length;

  return (
    <div>
      <PageHeader title="Yutuqlar" subtitle={`${unlocked}/${badges.length} nishon ochilgan`} />
      <div className="mb-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-end justify-between">
          <div><p className="text-sm text-muted-foreground">Daraja {lv.level}</p><p className="text-2xl font-bold">{levelTitle(lv.level)}</p></div>
          <p className="text-sm font-semibold text-primary">{xp} XP</p>
        </div>
        <Progress value={(lv.into / lv.need) * 100} className="mt-3" />
        <p className="mt-2 text-xs text-muted-foreground">Keyingi darajagacha {lv.need - lv.into} XP. Odat 10, asosiy ish 20, mashq 15, kundalik 10, kitob 5 XP.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {badges.map((b) => (
          <div
            key={b.title}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-4",
              b.got ? "border-primary/40 bg-primary/5" : "border-border bg-card",
            )}
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                b.got ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {b.got ? <Trophy className="size-5" /> : <Lock className="size-4" />}
            </div>
            <div>
              <p className="text-sm font-semibold">{b.title}</p>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
