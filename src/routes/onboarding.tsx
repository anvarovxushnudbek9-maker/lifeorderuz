import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { GOALS, SPORTS } from "@/lib/plan";

const TITLE = "Tizimingizni sozlash — Life Order";
const DESC = "1 daqiqalik test: javoblaringiz asosida Life Order sizga har kuni 3 ta eng muhim qadamni tanlaydi.";

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

type Opt = { v: string; t: string; d?: string; e?: string };
type Q = { key: string; section: string; q: string; hint?: string; options: (a: Record<string, string>) => Opt[] };

const o = (list: string[]): Opt[] => list.map((t) => ({ v: t, t }));

// Each answer feeds the Life Engine (see src/lib/life-engine.ts).
const QUESTIONS: Q[] = [
  { key: "main_goal", section: "Maqsad", q: "Keyingi 90 kunda eng ko'p nimani o'zgartirmoqchisiz?", hint: "Bittasini tanlang — fokus kuch beradi.", options: () => [
    { v: "Telefonga qaramlikdan qutulish", t: "Telefonga qaramlikdan qutulish", e: "📵" },
    { v: "Intizomli kun tartibi", t: "Intizomli kun tartibi", e: "⏰" },
    { v: "Sog'lom tana va energiya", t: "Sog'lom tana va energiya", e: "💪" },
    { v: "Bilim va o'qish", t: "Bilim va o'qish", e: "📚" },
    { v: "Ish va karyerada o'sish", t: "Ish va karyerada o'sish", e: "🚀" },
  ] },
  { key: "age_range", section: "Siz haqingizda", q: "Yoshingiz?", hint: "Tavsiyalar yoshingizga xavfsiz bo'lishi uchun.", options: () => o(["18 dan kichik", "18–24", "25–34", "35–44", "45+"]) },
  { key: "life_stage", section: "Siz haqingizda", q: "Hozir asosan nima bilan bandsiz?", options: () => o(["Maktab o'quvchisi", "Talaba", "Ishlayman", "O'z biznesim", "Ota-ona / uy"]) },
  { key: "why_now", section: "Sabab", q: "Nega aynan hozir?", options: () => o(["Ko'p boshlayman, lekin tashlab yuboraman", "Vaqtim telefonga ketyapti", "Sog'lig'im va energiyam pasaydi", "Aniq maqsadim bor, tizim kerak", "Hayotimda o'zgarish kerak"]) },
  { key: "biggest_obstacle", section: "To'siq", q: "Rejangizni ko'pincha nima buzadi?", hint: "Rostini tanlang — bu faqat sizga ko'rinadi.", options: () => o(["Intizom yetishmaydi", "Vaqt topa olmayman", "Telefon chalg'itadi", "Nimadan boshlashni bilmayman", "Charchoq va energiya"]) },
  { key: "start_style", section: "Xulq", q: "Muhim ish oldida odatda nima qilasiz?", options: () => o(["Darhol boshlayman", "Oxirgi daqiqagacha cho'zaman", "Mukammal bo'lishini kutaman", "Boshlayman, lekin tashlab qo'yaman"]) },
  { key: "screen_time", section: "Telefon", q: "Kuniga telefonda qancha vaqt o'tkazasiz?", hint: "Telefon sozlamalaridagi 'Ekran vaqti'ga qarang.", options: () => o(["2 soatdan kam", "2–4 soat", "4–6 soat", "6 soatdan ko'p"]) },
  { key: "morning_phone", section: "Telefon", q: "Uyg'ongach telefonni qachon olasiz?", options: () => o(["Darhol", "15 daqiqa ichida", "1 soatdan keyin", "Ertalab olmayman"]) },
  { key: "free_time", section: "Vaqt", q: "Kuniga o'zingiz uchun qancha bo'sh vaqtingiz bor?", hint: "Reja shunga sig'diriladi.", options: () => o(["30 daqiqadan kam", "30–60 daqiqa", "1–2 soat", "2 soatdan ko'p"]) },
  { key: "peak_time", section: "Vaqt", q: "Qachon eng samarali ishlaysiz?", options: () => o(["Ertalab", "Kunduzi", "Kechqurun", "Tunda"]) },
  { key: "activity_level", section: "Tana", q: "Jismoniy faolligingiz?", options: () => [
    { v: "low", t: "Kam harakat", d: "Asosan o'tiraman" },
    { v: "light", t: "Yengil", d: "Haftasiga 1–2 marta" },
    { v: "medium", t: "O'rtacha", d: "Haftasiga 3–4 marta" },
    { v: "high", t: "Faol", d: "Deyarli har kuni" },
  ] },
  { key: "goal_type", section: "Tana", q: "Tana bo'yicha maqsadingiz?", options: (a) =>
    GOALS.filter((g) => !(a["age_range"] === "18 dan kichik" && g.v === "lose")).map((g) => ({ v: g.v, t: g.t, d: g.d })) },
  { key: "sport_preference", section: "Tana", q: "Qaysi harakat turi sizga yoqadi?", options: () => o(SPORTS) },
];

const AREA_BY_GOAL: Record<string, string[]> = {
  "Telefonga qaramlikdan qutulish": ["Odatlar", "Ruhiyat"],
  "Intizomli kun tartibi": ["Odatlar"],
  "Sog'lom tana va energiya": ["Tana"],
  "Bilim va o'qish": ["Bilim"],
  "Ish va karyerada o'sish": ["Karyera", "Bilim"],
};

const PROFILE_KEYS = new Set(["main_goal", "why_now", "biggest_obstacle", "activity_level", "goal_type", "sport_preference"]);

function Onboarding() {
  const { session, user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const total = QUESTIONS.length;

  React.useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  async function finish(a: Record<string, string>) {
    if (!user) return;
    setSaving(true);
    try {
      const digital: Record<string, string> = {};
      for (const [k, v] of Object.entries(a)) if (!PROFILE_KEYS.has(k)) digital[k] = v;
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        main_goal: a["main_goal"] ?? null,
        focus_areas: AREA_BY_GOAL[a["main_goal"] ?? ""] ?? [],
        why_now: a["why_now"] ?? null,
        biggest_obstacle: a["biggest_obstacle"] ?? null,
        digital_habits: digital,
        activity_level: a["activity_level"] ?? null,
        goal_type: a["goal_type"] ?? null,
        sport_preference: a["sport_preference"] ?? null,
        onboarding_completed: true,
      });
      if (error) throw error;
      qc.setQueryData(["profile", user.id], (old: Record<string, unknown> | null | undefined) => ({ ...(old ?? {}), onboarding_completed: true }));
      await qc.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Tizimingiz tayyor — bugungi 3 qadam sizni kutmoqda!");
      navigate({ to: "/dashboard", replace: true });
    } catch (e) {
      toast.error((e as Error).message);
      setSaving(false);
    }
  }

  function pick(v: string) {
    const q = QUESTIONS[step]!;
    const next = { ...answers, [q.key]: v };
    setAnswers(next);
    window.setTimeout(() => {
      if (step + 1 < total) setStep(step + 1);
      else void finish(next);
    }, 220);
  }

  const q = QUESTIONS[step]!;
  const pct = Math.round((step / total) * 100);
  const remainingSec = Math.max(5, (total - step) * 5);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background px-5 py-8">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <button type="button" onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0 || saving} className="flex items-center gap-1 disabled:opacity-0" aria-label="Orqaga">
            <ArrowLeft className="size-3.5" /> Orqaga
          </button>
          <span>{step + 1} / {total} · ~{remainingSec} soniya qoldi</span>
        </div>
        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full gradient-primary transition-all duration-500 ease-out" style={{ width: `${Math.max(4, pct)}%` }} />
        </div>

        {saving ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center" style={{ animation: "osish-step 0.35s ease-out" }}>
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="font-semibold">Javoblaringiz tahlil qilinmoqda…</p>
            <p className="text-sm text-muted-foreground">Bugungi shaxsiy rejangiz tuzilyapti.</p>
          </div>
        ) : (
          <div key={step} className="space-y-5" style={{ animation: "osish-step 0.35s cubic-bezier(0.22,1,0.36,1)" }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{q.section}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">{q.q}</h1>
              {q.hint && <p className="mt-1 text-sm text-muted-foreground">{q.hint}</p>}
            </div>
            <div className="space-y-2">
              {q.options(answers).map((opt, i) => {
                const on = answers[q.key] === opt.v;
                return (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => pick(opt.v)}
                    style={{ animation: `osish-step 0.4s ${i * 40}ms both cubic-bezier(0.22,1,0.36,1)` }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-200 active:scale-[0.98]",
                      on ? "border-primary bg-primary/5 shadow-elegant" : "border-border hover:border-primary/40 hover:bg-accent",
                    )}
                  >
                    {opt.e && <span className="text-xl">{opt.e}</span>}
                    <span className="flex-1">
                      <span className="block font-medium">{opt.t}</span>
                      {opt.d && <span className="block text-xs text-muted-foreground">{opt.d}</span>}
                    </span>
                    {on && <Check className="size-4 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
