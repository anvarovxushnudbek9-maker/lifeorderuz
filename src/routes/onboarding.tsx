import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TITLE = "Boshlash — O'SISH";
const DESC = "Uch qadamda profilingizni sozlang va shaxsiy rivojlanish yo'lingizni boshlang.";

const AREAS = ["Tana", "Bilim", "Odatlar", "Davra", "Ruhiyat", "Moliya", "Karyera"];
const STARTER_HABITS = [
  { title: "Ertalabki mashq", emoji: "🏃", category: "tana" },
  { title: "30 daqiqa kitob", emoji: "📚", category: "bilim" },
  { title: "2 litr suv", emoji: "💧", category: "tana" },
  { title: "Kundalik yozish", emoji: "📝", category: "ruhiyat" },
  { title: "Erta uyqu", emoji: "🌙", category: "tana" },
];

export const Route = createFileRoute("/onboarding")({
  ssr: false,
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
  component: Onboarding,
});

function Onboarding() {
  const { session, user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [areas, setAreas] = React.useState<string[]>([]);
  const [habits, setHabits] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  async function finish() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name || null,
        main_goal: goal || null,
        focus_areas: areas,
        onboarding_completed: true,
      });
      if (error) throw error;

      const chosen = STARTER_HABITS.filter((h) => habits.includes(h.title));
      if (chosen.length) {
        await supabase
          .from("habits")
          .insert(chosen.map((h) => ({ ...h, user_id: user.id, target_per_week: 7 })));
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background px-5 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Tanishamiz</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sizni qanday chaqiraylik va asosiy maqsadingiz nima?
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Ismingiz</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal">Asosiy maqsad</Label>
              <Input
                id="goal"
                placeholder="Masalan: har kuni mashq qilish"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Yo&apos;nalishlar</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Qaysi sohalarga e&apos;tibor qaratmoqchisiz?
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => {
                const on = areas.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAreas(on ? areas.filter((x) => x !== a) : [...areas, a])}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Birinchi odatlar</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Bir nechtasini tanlang — keyin o&apos;zgartirishingiz mumkin.
              </p>
            </div>
            <div className="space-y-2">
              {STARTER_HABITS.map((h) => {
                const on = habits.includes(h.title);
                return (
                  <button
                    key={h.title}
                    type="button"
                    onClick={() =>
                      setHabits(on ? habits.filter((x) => x !== h.title) : [...habits, h.title])
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                      on ? "border-primary bg-primary/5" : "border-border hover:bg-accent",
                    )}
                  >
                    <span className="text-lg">{h.emoji}</span>
                    <span className="flex-1">{h.title}</span>
                    {on && <Check className="size-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
              Orqaga
            </Button>
          )}
          {step < 2 ? (
            <Button className="flex-1" onClick={() => setStep(step + 1)}>
              Davom etish <ArrowRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button className="flex-1" onClick={finish} disabled={saving}>
              Boshlash
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
