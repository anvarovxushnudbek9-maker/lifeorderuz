import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Flame, Beef, Wheat, Droplets, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { todayISO } from "@/lib/date";
import { GOALS, SPORTS, buildNutrition, buildWorkoutPlan } from "@/lib/plan";

const TITLE = "Shaxsiy reja — Life Order";
const DESC = "Yosh, jins, bo'y, vazn va maqsadingizga moslangan kaloriya, makro va mashq rejasi.";

export const Route = createFileRoute("/_authenticated/shaxsiy-reja")({
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
  component: PersonalPlan,
});

function PersonalPlan() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const today = todayISO();
  const [saving, setSaving] = React.useState(false);

  const { data } = useQuery({
    queryKey: ["personal-plan", uid, today],
    enabled: !!uid,
    queryFn: async () => {
      const [profile, meals] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase.from("meals").select("kcal,protein_g").eq("user_id", uid).eq("eaten_on", today),
      ]);
      return { profile: profile.data, meals: meals.data ?? [] };
    },
  });

  const profile = data?.profile;
  const plan = profile ? buildNutrition(profile) : null;
  const week = buildWorkoutPlan(profile?.goal_type ?? null, profile?.sport_preference ?? null);
  const kcalToday = (data?.meals ?? []).reduce((s, m) => s + (m.kcal ?? 0), 0);
  const proteinToday = (data?.meals ?? []).reduce((s, m) => s + (m.protein_g ?? 0), 0);

  async function update(patch: { goal_type?: string; sport_preference?: string }) {
    if (!uid) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(patch).eq("id", uid);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Reja yangilandi");
    qc.invalidateQueries({ queryKey: ["personal-plan"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  return (
    <div>
      <PageHeader
        title="Shaxsiy reja"
        subtitle="Raqamlaringizga moslangan ovqat va mashq tizimi."
      />

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Maqsadingiz</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {GOALS.map((g) => (
            <button
              key={g.v}
              onClick={() => update({ goal_type: g.v })}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.99]",
                profile?.goal_type === g.v
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent",
              )}
            >
              <span className="block text-sm font-medium">{g.t}</span>
              <span className="block text-xs text-muted-foreground">{g.d}</span>
            </button>
          ))}
        </div>

        <h2 className="mt-6 text-sm font-semibold">Sport turi</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SPORTS.map((s) => (
            <button
              key={s}
              onClick={() => update({ sport_preference: s })}
              className={cn(
                "rounded-full border px-4 py-2 text-xs transition-all active:scale-95",
                profile?.sport_preference === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {saving && (
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Saqlanmoqda…
          </p>
        )}
      </section>

      <h2 className="mt-8 text-base font-semibold">Kunlik norma</h2>
      {!plan ? (
        <EmptyState text="Yosh, bo'y va vaznni profilda to'ldiring — reja avtomatik hisoblanadi." />
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card icon={<Flame className="size-4" />} label="Kaloriya" value={`${plan.kcal} kcal`} />
            <Card icon={<Beef className="size-4" />} label="Oqsil" value={`${plan.protein} g`} />
            <Card icon={<Wheat className="size-4" />} label="Uglevod" value={`${plan.carbs} g`} />
            <Card icon={<Droplets className="size-4" />} label="Suv" value={`${plan.water} ml`} />
          </div>
          <div className="mt-3 rounded-2xl border border-border bg-card p-5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Bugun: {kcalToday} kcal</span>
              <span>Norma: {plan.kcal} kcal</span>
            </div>
            <Progress
              value={Math.min(100, Math.round((kcalToday / plan.kcal) * 100))}
              className="mt-2"
            />
            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              <span>Oqsil: {proteinToday} g</span>
              <span>Norma: {plan.protein} g</span>
            </div>
            <Progress
              value={Math.min(100, Math.round((proteinToday / plan.protein) * 100))}
              className="mt-2"
            />
            <p className="mt-4 text-xs text-muted-foreground">
              BMR {plan.bmr} kcal · TDEE {plan.tdee} kcal · Yog&apos; {plan.fat} g
            </p>
            <p className="mt-2 text-sm">{plan.note}</p>
          </div>
        </>
      )}

      <h2 className="mt-8 text-base font-semibold">Haftalik mashq rejasi</h2>
      <div className="mt-3 space-y-2">
        {week.map((d) => (
          <div
            key={d.day}
            className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{d.focus}</p>
              <p className="text-xs text-muted-foreground">{d.detail}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </span>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}
