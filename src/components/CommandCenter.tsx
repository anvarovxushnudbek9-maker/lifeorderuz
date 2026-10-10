import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, SkipForward, Target, Undo2, Zap } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { todayISO, lastNDays } from "@/lib/date";
import { decide, SKIP_REASONS, type EngineProfile } from "@/lib/life-engine";

type Item = {
  id: string;
  title: string;
  why: string | null;
  domain: string;
  minutes: number;
  status: string;
  skip_reason: string | null;
  position: number;
};

export function CommandCenter() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const today = todayISO();
  const qc = useQueryClient();
  const [skipFor, setSkipFor] = React.useState<string | null>(null);
  const key = ["life-engine", uid, today];

  const { data, isLoading } = useQuery({
    queryKey: key,
    enabled: !!uid,
    queryFn: async () => {
      const from = lastNDays(14)[0]!;
      const [profile, history, habits, logs, metrics] = await Promise.all([
        supabase.from("profiles").select("main_goal,goal_type,biggest_obstacle,focus_areas,activity_level,digital_habits").eq("id", uid).maybeSingle(),
        supabase.from("daily_plan_items").select("*").eq("user_id", uid).gte("plan_date", from).order("position"),
        supabase.from("habits").select("id").eq("user_id", uid).eq("archived", false),
        supabase.from("habit_logs").select("habit_id").eq("user_id", uid).eq("log_date", today),
        supabase.from("body_metrics").select("sleep_hours").eq("user_id", uid).eq("metric_date", today).maybeSingle(),
      ]);
      const all = history.data ?? [];
      const past = all.filter((i) => i.plan_date < today);
      let todays = all.filter((i) => i.plan_date === today);
      const result = decide({
        profile: (profile.data ?? {}) as EngineProfile,
        history: past,
        habitsTotal: habits.data?.length ?? 0,
        habitsDoneToday: new Set((logs.data ?? []).map((l) => l.habit_id)).size,
        sleepHours: metrics.data?.sleep_hours != null ? Number(metrics.data.sleep_hours) : null,
        todayISO: today,
      });
      if (todays.length === 0 && result.actions.length) {
        const { data: inserted, error } = await supabase
          .from("daily_plan_items")
          .upsert(
            result.actions.map((a, i) => ({ user_id: uid, plan_date: today, position: i, title: a.title, why: a.why, domain: a.domain, minutes: a.minutes, source: a.source })),
            { onConflict: "user_id,plan_date,title", ignoreDuplicates: true },
          )
          .select("*");
        if (error) throw error;
        todays = inserted ?? [];
      }
      const pastDone = past.filter((p) => p.status === "done").length;
      return {
        items: todays.sort((a, b) => a.position - b.position) as Item[],
        diagnosis: result.diagnosis,
        load: result.load,
        weekRate: past.length ? Math.round((pastDone / past.length) * 100) : null,
      };
    },
  });

  const update = useMutation({
    mutationFn: async (p: { id: string; status: string; skip_reason?: string | null }) => {
      const { error } = await supabase
        .from("daily_plan_items")
        .update({ status: p.status, skip_reason: p.skip_reason ?? null, completed_at: p.status === "done" ? new Date().toISOString() : null })
        .eq("id", p.id);
      if (error) throw error;
    },
    onMutate: async (p) => {
      await qc.cancelQueries({ queryKey: key });
      qc.setQueryData(key, (old: typeof data) =>
        old ? { ...old, items: old.items.map((i) => (i.id === p.id ? { ...i, status: p.status, skip_reason: p.skip_reason ?? null } : i)) } : old,
      );
    },
    onError: (e: Error) => {
      toast.error(e.message);
      qc.invalidateQueries({ queryKey: key });
    },
  });

  const items = data?.items ?? [];
  const done = items.filter((i) => i.status === "done").length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-label="Bugungi asosiy qadamlar">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <Target className="size-3.5" /> Bugungi asosiy qadamlar
          </p>
          <h2 className="mt-1 text-lg font-bold">
            {items.length === 0 ? "Rejangiz tayyorlanmoqda" : done === items.length ? "Bugun g'alaba! 🎉" : `${items.length - done} ta qadam qoldi`}
          </h2>
        </div>
        <span className="text-2xl font-bold text-primary">{pct}%</span>
      </div>
      <Progress value={pct} className="mt-3" />

      {data?.diagnosis && (
        <div className="mt-4 flex gap-2 rounded-xl bg-primary/5 p-3 text-sm">
          <Zap className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            <span className="font-semibold">{data.diagnosis.label}.</span>{" "}
            <span className="text-muted-foreground">{data.diagnosis.explain}</span>
            {data.load < 1 && <span className="text-muted-foreground"> Bugungi yuklama kamaytirildi.</span>}
          </p>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {isLoading && <li className="h-16 animate-pulse rounded-xl bg-muted" />}
        {items.map((it) => {
          const closed = it.status !== "todo";
          return (
            <li key={it.id} className={cn("rounded-xl border border-border p-3 transition-all", it.status === "done" && "border-primary/30 bg-primary/5", (it.status === "skipped" || it.status === "postponed") && "opacity-60")}>
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  aria-label={it.status === "done" ? "Bajarilmagan deb belgilash" : "Bajarildi"}
                  onClick={() => update.mutate({ id: it.id, status: it.status === "done" ? "todo" : "done" })}
                  className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90", it.status === "done" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40 hover:border-primary")}
                >
                  {it.status === "done" && <Check className="size-3.5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", it.status === "done" && "line-through decoration-primary/50")}>{it.title}</p>
                  {it.why && <p className="mt-0.5 text-xs text-muted-foreground">{it.why}</p>}
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" /> {it.minutes} daq
                    {it.skip_reason && <span>· {it.status === "postponed" ? "Ertaga" : "O'tkazildi"}: {it.skip_reason}</span>}
                  </p>
                </div>
                {closed && it.status !== "done" ? (
                  <Button size="icon" variant="ghost" aria-label="Qaytarish" onClick={() => update.mutate({ id: it.id, status: "todo" })}>
                    <Undo2 className="size-4" />
                  </Button>
                ) : !closed ? (
                  <Button size="icon" variant="ghost" aria-label="Bajara olmadim" onClick={() => setSkipFor(skipFor === it.id ? null : it.id)}>
                    <SkipForward className="size-4" />
                  </Button>
                ) : null}
              </div>
              {skipFor === it.id && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="mb-2 text-xs text-muted-foreground">Nima xalaqit berdi? Ertangi reja shunga moslashadi.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SKIP_REASONS.map((r) => (
                      <button key={r} type="button" onClick={() => { update.mutate({ id: it.id, status: "postponed", skip_reason: r }); setSkipFor(null); }} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent">
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {data?.weekRate != null && (
        <p className="mt-3 text-xs text-muted-foreground">Oxirgi 2 hafta bajarilishi: {data.weekRate}% — tizim yuklamani shunga qarab o'zgartiradi.</p>
      )}
    </section>
  );
}
