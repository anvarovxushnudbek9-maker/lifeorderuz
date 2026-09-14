import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Lock } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const TITLE = "Yutuqlar — O'SISH";
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
      const [logs, workouts, books, journal, members] = await Promise.all([
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
      ]);
      return {
        logs: logs.count ?? 0,
        workouts: workouts.count ?? 0,
        books: books.count ?? 0,
        journal: journal.count ?? 0,
        circles: members.count ?? 0,
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
    { title: "Davra a'zosi", desc: "Bitta davraga qo'shiling", got: (data?.circles ?? 0) >= 1 },
  ];

  const unlocked = badges.filter((b) => b.got).length;

  return (
    <div>
      <PageHeader title="Yutuqlar" subtitle={`${unlocked}/${badges.length} nishon ochilgan`} />
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
