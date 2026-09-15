import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { lastNDays, todayISO, shortDate } from "@/lib/date";

const TITLE = "Odatlar — Life Order";
const DESC = "Kunlik odatlaringizni belgilang, ketma-ketlikni saqlang va haftalik natijani ko'ring.";

export const Route = createFileRoute("/_authenticated/odat")({
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
  component: Habits,
});

function Habits() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const days = lastNDays(7);
  const today = todayISO();
  const [title, setTitle] = React.useState("");
  const [emoji, setEmoji] = React.useState("");

  const { data } = useQuery({
    queryKey: ["habits", uid],
    enabled: !!uid,
    queryFn: async () => {
      const [habits, logs] = await Promise.all([
        supabase
          .from("habits")
          .select("*")
          .eq("user_id", uid)
          .eq("archived", false)
          .order("created_at"),
        supabase.from("habit_logs").select("*").eq("user_id", uid).gte("log_date", days[0]!),
      ]);
      return { habits: habits.data ?? [], logs: logs.data ?? [] };
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("habits")
        .insert({ user_id: uid, title, emoji: emoji || "✅" });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setEmoji("");
      qc.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ habitId, date, on }: { habitId: string; date: string; on: boolean }) => {
      if (on) {
        const { error } = await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habitId)
          .eq("log_date", date);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("habit_logs")
          .insert({ user_id: uid, habit_id: habitId, log_date: date });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });

  const logSet = new Set((data?.logs ?? []).map((l) => `${l.habit_id}|${l.log_date}`));
  const habits = data?.habits ?? [];

  return (
    <div>
      <PageHeader title="Odatlar" subtitle="Kichik takrorlar — katta o'zgarish." />

      <form
        className="mb-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) add.mutate();
        }}
      >
        <Input
          className="w-16 shrink-0 text-center"
          placeholder="🏃"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
        />
        <Input
          placeholder="Yangi odat nomi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button type="submit" size="icon" className="shrink-0" disabled={add.isPending}>
          <Plus className="size-4" />
        </Button>
      </form>

      {habits.length === 0 ? (
        <EmptyState text="Hali odat yo'q. Yuqoridan birinchi odatingizni qo'shing." />
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end gap-1.5 pr-9 text-[10px] text-muted-foreground">
            {days.map((d) => (
              <span key={d} className="w-8 text-center">
                {shortDate(d)}
              </span>
            ))}
          </div>
          {habits.map((h) => {
            const streak = countStreak(logSet, h.id, days);
            return (
              <div key={h.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      <span className="mr-2">{h.emoji}</span>
                      {h.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Ketma-ketlik: {streak} kun · haftasiga {h.target_per_week} marta
                    </p>
                  </div>
                  <button
                    onClick={() => remove.mutate(h.id)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-3 flex justify-end gap-1.5">
                  {days.map((d) => {
                    const on = logSet.has(`${h.id}|${d}`);
                    return (
                      <button
                        key={d}
                        onClick={() => toggle.mutate({ habitId: h.id, date: d, on })}
                        className={cn(
                          "size-8 rounded-lg border text-xs font-semibold transition-colors",
                          on
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-accent",
                          d === today && !on && "border-primary/50",
                        )}
                      >
                        {on ? "✓" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function countStreak(logSet: Set<string>, habitId: string, days: string[]) {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (logSet.has(`${habitId}|${days[i]}`)) streak++;
    else if (i !== days.length - 1) break;
  }
  return streak;
}
