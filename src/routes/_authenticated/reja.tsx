import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Progress } from "@/components/ui/progress";
import { lastNDays, shortDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const TITLE = "Haftalik reja — O'SISH";
const DESC = "Haftalik odatlar jadvali: qaysi kun nima bajarildi va nima qoldi.";

export const Route = createFileRoute("/_authenticated/reja")({
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
  component: WeeklyPlan,
});

function WeeklyPlan() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const days = lastNDays(7);

  const { data } = useQuery({
    queryKey: ["plan", uid],
    enabled: !!uid,
    queryFn: async () => {
      const [habits, logs] = await Promise.all([
        supabase.from("habits").select("*").eq("user_id", uid).eq("archived", false),
        supabase.from("habit_logs").select("*").eq("user_id", uid).gte("log_date", days[0]!),
      ]);
      return { habits: habits.data ?? [], logs: logs.data ?? [] };
    },
  });

  const habits = data?.habits ?? [];
  const logSet = new Set((data?.logs ?? []).map((l) => `${l.habit_id}|${l.log_date}`));

  return (
    <div>
      <PageHeader title="Haftalik reja" subtitle="Bu haftada qanday ketyapsiz." />

      {habits.length === 0 ? (
        <EmptyState text="Reja tuzish uchun avval odat qo'shing." />
      ) : (
        <div className="space-y-4">
          {habits.map((h) => {
            const done = days.filter((d) => logSet.has(`${h.id}|${d}`)).length;
            const pct = Math.min(100, Math.round((done / (h.target_per_week || 7)) * 100));
            return (
              <div key={h.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    <span className="mr-2">{h.emoji}</span>
                    {h.title}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {done}/{h.target_per_week}
                  </span>
                </div>
                <Progress value={pct} className="mt-3" />
                <div className="mt-3 flex gap-1.5">
                  {days.map((d) => (
                    <div
                      key={d}
                      className={cn(
                        "flex-1 rounded-md py-1 text-center text-[10px]",
                        logSet.has(`${h.id}|${d}`)
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {shortDate(d)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
