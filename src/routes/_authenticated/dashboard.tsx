import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Dumbbell, BookOpen, CheckCircle2, Users, Flame, Droplets, Moon } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Progress } from "@/components/ui/progress";
import { todayISO, lastNDays } from "@/lib/date";

const TITLE = "Asosiy panel — O'SISH";
const DESC = "Bugungi odatlar, mashqlar, o'qish va davra faoliyatingiz bitta ekranda.";

export const Route = createFileRoute("/_authenticated/dashboard")({
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
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const today = todayISO();
  const week = lastNDays(7);

  const { data } = useQuery({
    queryKey: ["dashboard", uid, today],
    enabled: !!uid,
    queryFn: async () => {
      const [habits, logs, workouts, books, metrics, circles] = await Promise.all([
        supabase.from("habits").select("id,title,emoji").eq("user_id", uid).eq("archived", false),
        supabase.from("habit_logs").select("habit_id,log_date").eq("user_id", uid).gte("log_date", week[0]!),
        supabase.from("workouts").select("id,duration_min").eq("user_id", uid).gte("performed_on", week[0]!),
        supabase.from("books").select("id,title,current_page,total_pages").eq("user_id", uid).eq("status", "oqilmoqda"),
        supabase.from("body_metrics").select("*").eq("user_id", uid).eq("metric_date", today).maybeSingle(),
        supabase.from("circle_members").select("circle_id").eq("user_id", uid),
      ]);
      return {
        habits: habits.data ?? [],
        logs: logs.data ?? [],
        workouts: workouts.data ?? [],
        books: books.data ?? [],
        metrics: metrics.data,
        circleCount: circles.data?.length ?? 0,
      };
    },
  });

  const habits = data?.habits ?? [];
  const doneToday = new Set(
    (data?.logs ?? []).filter((l) => l.log_date === today).map((l) => l.habit_id),
  );
  const habitPct = habits.length ? Math.round((doneToday.size / habits.length) * 100) : 0;
  const weekMinutes = (data?.workouts ?? []).reduce((s, w) => s + (w.duration_min ?? 0), 0);
  const name = (user?.user_metadata?.["full_name"] as string | undefined)?.split(" ")[0];

  return (
    <div>
      <PageHeader
        title={name ? `Salom, ${name}` : "Salom"}
        subtitle="Bugun kichik bir qadam — ertaga katta farq."
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Bugungi odatlar</p>
            <p className="mt-1 text-3xl font-bold">
              {doneToday.size}
              <span className="text-lg text-muted-foreground">/{habits.length}</span>
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">{habitPct}%</span>
        </div>
        <Progress value={habitPct} className="mt-4" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          to="/tana"
          icon={<Dumbbell className="size-4" />}
          label="Haftalik mashq"
          value={`${weekMinutes} daq`}
        />
        <StatCard
          to="/bilim"
          icon={<BookOpen className="size-4" />}
          label="O'qilayotgan kitob"
          value={String(data?.books.length ?? 0)}
        />
        <StatCard
          to="/odat"
          icon={<CheckCircle2 className="size-4" />}
          label="Faol odatlar"
          value={String(habits.length)}
        />
        <StatCard
          to="/davra"
          icon={<Users className="size-4" />}
          label="Davralar"
          value={String(data?.circleCount ?? 0)}
        />
      </div>

      <h2 className="mt-8 text-base font-semibold">Bugungi tana ko&apos;rsatkichlari</h2>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <MiniStat
          icon={<Droplets className="size-4 text-primary" />}
          label="Suv"
          value={`${data?.metrics?.water_ml ?? 0} ml`}
        />
        <MiniStat
          icon={<Moon className="size-4 text-primary" />}
          label="Uyqu"
          value={`${data?.metrics?.sleep_hours ?? 0} s`}
        />
        <MiniStat
          icon={<Flame className="size-4 text-primary" />}
          label="Qadam"
          value={String(data?.metrics?.steps ?? 0)}
        />
      </div>

      <h2 className="mt-8 text-base font-semibold">Odatlar</h2>
      <div className="mt-3 space-y-2">
        {habits.length === 0 ? (
          <Link
            to="/odat"
            className="block rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground"
          >
            Hali odat qo&apos;shilmagan. Birinchi odatni qo&apos;shing.
          </Link>
        ) : (
          habits.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <span className="text-lg">{h.emoji}</span>
                {h.title}
              </span>
              <span
                className={
                  doneToday.has(h.id)
                    ? "text-xs font-semibold text-primary"
                    : "text-xs text-muted-foreground"
                }
              >
                {doneToday.has(h.id) ? "Bajarildi" : "Kutilmoqda"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({
  to,
  icon,
  label,
  value,
}: {
  to: "/tana" | "/bilim" | "/odat" | "/davra";
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
    >
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </span>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </Link>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <div className="flex justify-center">{icon}</div>
      <p className="mt-2 text-sm font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
