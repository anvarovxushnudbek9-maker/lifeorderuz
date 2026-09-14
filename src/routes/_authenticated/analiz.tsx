import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { lastNDays, shortDate } from "@/lib/date";

const TITLE = "Analiz va statistika — O'SISH";
const DESC = "Odatlar, mashqlar va tana ko'rsatkichlaringiz bo'yicha 14 kunlik grafik tahlil.";

export const Route = createFileRoute("/_authenticated/analiz")({
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
  component: Analytics,
});

function Analytics() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const days = lastNDays(14);

  const { data } = useQuery({
    queryKey: ["analytics", uid],
    enabled: !!uid,
    queryFn: async () => {
      const [logs, workouts, metrics] = await Promise.all([
        supabase.from("habit_logs").select("log_date").eq("user_id", uid).gte("log_date", days[0]!),
        supabase
          .from("workouts")
          .select("performed_on,duration_min")
          .eq("user_id", uid)
          .gte("performed_on", days[0]!),
        supabase
          .from("body_metrics")
          .select("metric_date,sleep_hours,steps")
          .eq("user_id", uid)
          .gte("metric_date", days[0]!),
      ]);
      return {
        logs: logs.data ?? [],
        workouts: workouts.data ?? [],
        metrics: metrics.data ?? [],
      };
    },
  });

  const chart = days.map((d) => ({
    day: shortDate(d),
    odat: (data?.logs ?? []).filter((l) => l.log_date === d).length,
    mashq: (data?.workouts ?? [])
      .filter((w) => w.performed_on === d)
      .reduce((s, w) => s + (w.duration_min ?? 0), 0),
    uyqu: Number((data?.metrics ?? []).find((m) => m.metric_date === d)?.sleep_hours ?? 0),
  }));

  const totalHabits = chart.reduce((s, c) => s + c.odat, 0);
  const totalMinutes = chart.reduce((s, c) => s + c.mashq, 0);
  const avgSleep = (() => {
    const vals = chart.map((c) => c.uyqu).filter((v) => v > 0);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "0";
  })();

  return (
    <div>
      <PageHeader title="Analiz" subtitle="Oxirgi 14 kun bo'yicha tahlil." />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Kpi label="Odat belgilari" value={String(totalHabits)} />
        <Kpi label="Mashq (daq)" value={String(totalMinutes)} />
        <Kpi label="O'rtacha uyqu" value={`${avgSleep} s`} />
      </div>

      <Panel title="Kunlik bajarilgan odatlar">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Bar dataKey="odat" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Mashq daqiqalari">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="mashq"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Uyqu (soat)">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="uyqu"
              stroke="var(--chart-2)"
              fill="var(--chart-2)"
              fillOpacity={0.15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded-2xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      {children}
    </div>
  );
}
