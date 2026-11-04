import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { GOALS, SPORTS } from "@/lib/plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ONBOARDING_GROUPS, isMinorAge, onboardingError } from "@/lib/onboarding";
import { decide } from "@/lib/life-engine";
import { todayISO } from "@/lib/date";

const TITLE = "Tizimingizni sozlash — Life Order";
const DESC = "Besh bosqichli test: javoblaringiz asosida Life Order sizga har kuni 3 ta eng muhim qadamni tanlaydi.";

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
    GOALS.filter((g) => !(isMinorAge(a["age"] ?? "") && ["lose", "gain"].includes(g.v))).map((g) => ({ v: g.v, t: g.t, d: g.d })) },
  { key: "sport_preference", section: "Tana", q: "Qaysi harakat turi sizga yoqadi?", options: () => o(SPORTS) },
];

const AREA_BY_GOAL: Record<string, string[]> = {
  "Telefonga qaramlikdan qutulish": ["Odatlar", "Ruhiyat"],
  "Intizomli kun tartibi": ["Odatlar"],
  "Sog'lom tana va energiya": ["Tana"],
  "Bilim va o'qish": ["Bilim"],
  "Ish va karyerada o'sish": ["Karyera", "Bilim"],
};

const PROFILE_KEYS = new Set(["main_goal", "why_now", "biggest_obstacle", "activity_level", "goal_type", "sport_preference", "full_name", "age", "gender", "height_cm", "weight_kg"]);
const STEP_TITLES = ["Yo‘nalishingiz", "Sizni nima to‘xtatyapti?", "Telefon odatlaringiz", "Kuningizning ritmi", "Siz va salomatligingiz"];

function Onboarding() {
  const { session, user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);
  const total = ONBOARDING_GROUPS.length;

  React.useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  async function finish(a: Record<string, string>) {
    if (!user) return;
    setSaving(true);
    try {
      const digital: Record<string, string> = { age_range: isMinorAge(a["age"] ?? "") ? "18 dan kichik" : Number(a["age"]) < 25 ? "18–24" : Number(a["age"]) < 35 ? "25–34" : "35+" };
      for (const [k, v] of Object.entries(a)) if (!PROFILE_KEYS.has(k)) digital[k] = v;
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: a["full_name"]?.trim() ?? null,
        age: Number(a["age"]),
        gender: a["gender"] || null,
        height_cm: a["height_cm"] ? Number(a["height_cm"]) : null,
        weight_kg: a["weight_kg"] ? Number(a["weight_kg"]) : null,
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

  function setAnswer(key: string, value: string) {
    setAnswers((old) => ({ ...old, [key]: value, ...(key === "age" && isMinorAge(value) ? { goal_type: "health" } : {}) }));
  }

  function next() {
    const error = onboardingError(answers, step);
    if (error) { toast.error(error); return; }
    if (step + 1 < total) setStep(step + 1);
    else setShowResult(true);
  }

  const keys = ONBOARDING_GROUPS[step];
  if (!keys) return null;
  const questions = QUESTIONS.filter((q) => keys.some((key) => key === q.key));
  const pct = showResult ? 100 : Math.round(((step + 1) / total) * 100);
  const preview = decide({ profile: { main_goal: answers["main_goal"] ?? null, biggest_obstacle: answers["biggest_obstacle"] ?? null, digital_habits: answers }, history: [], habitsTotal: 0, habitsDoneToday: 0, sleepHours: null, todayISO: todayISO() });

  return (
    <main className="min-h-screen bg-background px-5 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => showResult ? setShowResult(false) : setStep(step - 1)} disabled={(!showResult && step === 0) || saving}>
            <ArrowLeft className="size-4" /> Orqaga
          </Button>
          <span className="text-sm text-muted-foreground">{showResult ? "Rejangiz" : `${step + 1} / ${total}`}</span>
        </div>
        <progress className="mb-8 h-1.5 w-full accent-primary" max={100} value={pct} aria-label="Bosqichlar" />
        {showResult ? (
          <section className="space-y-6">
            <h1 className="text-3xl font-bold">{answers["full_name"]}, birinchi rejangiz tayyor</h1>
            <p className="text-muted-foreground">{preview.diagnosis.label}</p>
            <ol className="divide-y divide-border">
              {preview.actions.map((action, i) => <li key={action.title} className="flex items-center gap-4 py-5"><span className="text-lg font-semibold text-primary">{i + 1}</span><span className="flex-1 font-medium">{action.title}</span><span className="text-sm text-muted-foreground">{action.minutes} daqiqa</span></li>)}
            </ol>
            <Button size="lg" disabled={saving} onClick={() => void finish(answers)}>{saving ? <Loader2 className="size-4 animate-spin" /> : null}{saving ? "Saqlanmoqda…" : "Boshlash"}</Button>
          </section>
        ) : (
          <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); next(); }}>
            <h1 className="text-3xl font-bold">{STEP_TITLES[step]}</h1>
            {step === 4 && <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="full-name">Ismingiz</Label><Input id="full-name" autoComplete="given-name" maxLength={80} value={answers["full_name"] ?? ""} onChange={(e) => setAnswer("full_name", e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="age">Yoshingiz</Label><Input id="age" type="number" min={13} max={120} value={answers["age"] ?? ""} onChange={(e) => setAnswer("age", e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="height">Bo‘y (sm, ixtiyoriy)</Label><Input id="height" type="number" min={80} max={250} value={answers["height_cm"] ?? ""} onChange={(e) => setAnswer("height_cm", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="weight">Vazn (kg, ixtiyoriy)</Label><Input id="weight" type="number" min={20} max={300} step="0.1" value={answers["weight_kg"] ?? ""} onChange={(e) => setAnswer("weight_kg", e.target.value)} /></div>
              <fieldset className="space-y-2 sm:col-span-2"><legend className="text-sm font-medium">Jins (ixtiyoriy)</legend><div className="flex flex-wrap gap-2">{[{ v: "male", t: "Erkak" }, { v: "female", t: "Ayol" }, { v: "", t: "Aytishni istamayman" }].map((opt) => <Button key={opt.t} type="button" variant={answers["gender"] === opt.v ? "default" : "outline"} onClick={() => setAnswer("gender", opt.v)}>{opt.t}</Button>)}</div></fieldset>
              {isMinorAge(answers["age"] ?? "") && <p className="text-sm text-muted-foreground sm:col-span-2">18 yoshgacha reja uyqu, o‘qish va xavfsiz harakatga qaratiladi. Vazn yoki kaloriya cheklash rejasi berilmaydi.</p>}
            </div>}
            {questions.map((q) => <fieldset key={q.key} className="space-y-3">
              <legend className="font-semibold">{q.q}</legend>
              {q.hint && <p className="text-sm text-muted-foreground">{q.hint}</p>}
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options(answers).map((opt) => <Button key={opt.v} type="button" variant="outline" aria-pressed={answers[q.key] === opt.v} onClick={() => setAnswer(q.key, opt.v)} className={cn("h-auto min-h-12 justify-start whitespace-normal py-3 text-left", answers[q.key] === opt.v && "border-primary bg-primary/5")}>
                  <span className="flex-1"><span className="block">{opt.e} {opt.t}</span>{opt.d && <span className="block text-xs text-muted-foreground">{opt.d}</span>}</span>{answers[q.key] === opt.v && <Check className="size-4 shrink-0 text-primary" />}
                </Button>)}
              </div>
            </fieldset>)}
            {step === 0 && <div className="space-y-2"><Label htmlFor="extra">Yana nima muhim? (ixtiyoriy)</Label><Input id="extra" maxLength={500} value={answers["extra_note"] ?? ""} onChange={(e) => setAnswer("extra_note", e.target.value)} /></div>}
            <div className="border-t border-border pt-6"><Button type="submit" size="lg" className="w-full sm:w-auto">{step === 4 ? "Rejamni ko‘rish" : "Davom etish"}</Button></div>
          </form>
        )}
      </div>
    </main>
  );
}
