import { useQuery } from "@tanstack/react-query";
import { Radar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { lastNDays } from "@/lib/date";
import { lifeBalance, weakest } from "@/lib/life-balance";

export function LifeRadar() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const days = lastNDays(7);
  const from = days[0]!;
  const { data } = useQuery({
    queryKey: ["life-radar", uid, from],
    enabled: !!uid,
    queryFn: async () => {
      const [w, m, plan, habits, logs, msgs] = await Promise.all([
        supabase.from("workouts").select("performed_on").eq("user_id", uid).gte("performed_on", from),
        supabase.from("body_metrics").select("metric_date").eq("user_id", uid).gte("metric_date", from),
        supabase.from("daily_plan_items").select("status,domain,plan_date").eq("user_id", uid).gte("plan_date", from),
        supabase.from("habits").select("id").eq("user_id", uid).eq("archived", false),
        supabase.from("habit_logs").select("id").eq("user_id", uid).gte("log_date", from),
        supabase.from("circle_messages").select("id").eq("user_id", uid).gte("created_at", `${from}T00:00:00`),
      ]);
      const body = new Set([...(w.data ?? []).map((x) => x.performed_on), ...(m.data ?? []).map((x) => x.metric_date)]);
      const items = plan.data ?? [];
      const learn = new Set(items.filter((i) => i.domain === "bilim" && i.status === "done").map((i) => i.plan_date));
      return lifeBalance({
        bodyDays: body.size, learnDays: learn.size,
        habitLogs: logs.data?.length ?? 0, habitsTotal: habits.data?.length ?? 0,
        planDone: items.filter((i) => i.status === "done").length, planTotal: items.length,
        circleMessages: msgs.data?.length ?? 0,
      });
    },
  });
  if (!data) return null;
  const c = 90, r = 70;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / data.length - Math.PI / 2;
    return [c + Math.cos(a) * r * v, c + Math.sin(a) * r * v] as const;
  };
  const poly = data.map((d, i) => pt(i, Math.max(0.04, d.score / 100)).join(",")).join(" ");
  const weak = weakest(data);
  return (
    <section className="rounded-2xl border border-border bg-card p-4" aria-label="Hayot balansi">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary"><Radar className="size-3.5" />Hayot balansi · 7 kun</p>
      <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
        <svg viewBox="0 0 180 180" className="size-44 shrink-0" role="img" aria-label="Hayot balansi radari">
          {[0.33, 0.66, 1].map((s) => <polygon key={s} points={data.map((_, i) => pt(i, s).join(",")).join(" ")} className="fill-none stroke-border" />)}
          <polygon points={poly} className="fill-primary/20 stroke-primary" strokeWidth={2} />
          {data.map((d, i) => { const [x, y] = pt(i, 1.2); return <text key={d.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[9px]">{d.label}</text>; })}
        </svg>
        <ul className="w-full space-y-1 text-sm">
          {data.map((d) => <li key={d.key} className="flex justify-between"><span>{d.label}</span><span className={d.score < 40 ? "font-semibold text-destructive" : "font-semibold"}>{d.score}</span></li>)}
        </ul>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{weak ? `Diqqat: oxirgi 7 kunda "${weak.label}" sohasi orqada qolmoqda. Bugun unga bitta kichik qadam qo'shing.` : "Sohalar muvozanatda — shunday davom eting."}</p>
    </section>
  );
}
