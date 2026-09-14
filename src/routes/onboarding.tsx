import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, Loader2, Smartphone } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TITLE = "Boshlash — O'SISH";
const DESC = "Besh qadamda profilingizni sozlang va shaxsiy rivojlanish tizimingizni yarating.";

const AREAS = ["Tana", "Bilim", "Odatlar", "Davra", "Ruhiyat", "Moliya", "Karyera"];

const WHY_NOW = [
  "Hayotimda o'zgarish kerak bo'lib qoldi",
  "Ko'p boshlayman, lekin tashlab yuboraman",
  "Vaqtim telefonga ketyapti",
  "Sog'lig'im va energiyam pasaydi",
  "Aniq maqsadim bor, tizim kerak",
];

const OBSTACLES = [
  "Intizom yetishmaydi",
  "Vaqt topa olmayman",
  "Rejani kuzatmayman",
  "Atrofimda qo'llab-quvvatlovchi yo'q",
  "Nimadan boshlashni bilmayman",
];

type Q = { key: string; q: string; options: string[] };

const PHONE_QUESTIONS: Q[] = [
  {
    key: "screen_time",
    q: "Kuniga telefonda o'rtacha qancha vaqt o'tkazasiz?",
    options: ["2 soatdan kam", "2–4 soat", "4–6 soat", "6 soatdan ko'p"],
  },
  {
    key: "morning_phone",
    q: "Uyg'onganingizdan keyin telefonni qachon olasiz?",
    options: ["Darhol", "15 daqiqa ichida", "1 soatdan keyin", "Ertalab umuman olmayman"],
  },
  {
    key: "night_phone",
    q: "Telefon yotoqxonada, yoningizda uxlaydimi?",
    options: ["Ha, yonimda", "Xonada, lekin uzoqda", "Boshqa xonada"],
  },
  {
    key: "social",
    q: "Ijtimoiy tarmoqlar kuningizga qanday ta'sir qiladi?",
    options: ["Juda ko'p vaqtimni yeydi", "Ba'zan chalg'itadi", "Nazoratda", "Deyarli ishlatmayman"],
  },
  {
    key: "notifications",
    q: "Bildirishnomalar holati qanday?",
    options: ["Hammasi yoqilgan", "Bir qismi o'chirilgan", "Faqat muhimlari", "Deyarli hammasi o'chiq"],
  },
];

const ACTIVITY = [
  { v: "low", t: "Kam harakat", d: "Asosan o'tirib ishlayman" },
  { v: "light", t: "Yengil", d: "Haftasiga 1–2 marta harakat" },
  { v: "medium", t: "O'rtacha", d: "Haftasiga 3–4 marta mashq" },
  { v: "high", t: "Faol", d: "Deyarli har kuni mashq" },
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

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-all duration-200 active:scale-95",
        on
          ? "border-primary bg-primary text-primary-foreground shadow-elegant"
          : "border-border text-muted-foreground hover:border-primary/40 hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

function OptionRow({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 active:scale-[0.99]",
        on ? "border-primary bg-primary/5" : "border-border hover:bg-accent",
      )}
    >
      <span className="flex-1">{children}</span>
      {on && <Check className="size-4 shrink-0 text-primary" />}
    </button>
  );
}

function Onboarding() {
  const { session, user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);
  const [dir, setDir] = React.useState<1 | -1>(1);
  const [saving, setSaving] = React.useState(false);

  // step 1-3
  const [name, setName] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [areas, setAreas] = React.useState<string[]>([]);
  const [whyNow, setWhyNow] = React.useState("");
  const [obstacle, setObstacle] = React.useState("");
  // step 4
  const [phone, setPhone] = React.useState<Record<string, string>>({});
  // step 5
  const [age, setAge] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [activity, setActivity] = React.useState("");

  React.useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  const canNext = [
    name.trim().length > 0 && goal.trim().length > 0,
    whyNow.length > 0 && areas.length > 0,
    obstacle.length > 0,
    PHONE_QUESTIONS.every((q) => phone[q.key]),
    age !== "" && gender !== "" && height !== "" && weight !== "" && activity !== "",
  ][step];

  function go(next: number) {
    setDir(next > step ? 1 : -1);
    setStep(next);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finish() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name || null,
        main_goal: goal || null,
        focus_areas: areas,
        why_now: whyNow || null,
        biggest_obstacle: obstacle || null,
        digital_habits: phone,
        age: age ? Number(age) : null,
        gender: gender || null,
        height_cm: height ? Number(height) : null,
        weight_kg: weight ? Number(weight) : null,
        activity_level: activity || null,
        onboarding_completed: true,
      });
      if (error) throw error;
      toast.success("Tizimingiz tayyor!");
      navigate({ to: "/dashboard", replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background px-5 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {step + 1} / 5 qadam
          </span>
          <span>{Math.round(((step + 1) / 5) * 100)}%</span>
        </div>
        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full gradient-primary transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </div>

        <div
          key={step}
          className="space-y-5"
          style={{
            animation: `osish-step 0.35s cubic-bezier(0.22,1,0.36,1)`,
          }}
        >
          {step === 0 && (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Tanishamiz</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sizni qanday chaqiraylik va keyingi 90 kunda nimaga erishmoqchisiz?
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Ismingiz</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Diyor"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal">Asosiy maqsad</Label>
                <Input
                  id="goal"
                  placeholder="Masalan: har kuni mashq qilib, 8 kg tashlash"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Qanchalik aniq bo&apos;lsa, AI murabbiy shunchalik foydali bo&apos;ladi.
                </p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Nega aynan hozir?</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sizni harakatga undayotgan asosiy sabab va e&apos;tibor qaratmoqchi
                  bo&apos;lgan sohalar.
                </p>
              </div>
              <div className="space-y-2">
                {WHY_NOW.map((w) => (
                  <OptionRow key={w} on={whyNow === w} onClick={() => setWhyNow(w)}>
                    {w}
                  </OptionRow>
                ))}
              </div>
              <div>
                <Label className="mb-2 block">Yo&apos;nalishlar</Label>
                <div className="flex flex-wrap gap-2">
                  {AREAS.map((a) => (
                    <Chip
                      key={a}
                      on={areas.includes(a)}
                      onClick={() =>
                        setAreas(
                          areas.includes(a) ? areas.filter((x) => x !== a) : [...areas, a],
                        )
                      }
                    >
                      {a}
                    </Chip>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Eng katta to&apos;siq</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Shu paytgacha sizni nima to&apos;xtatib kelgan? Tizim aynan shuni hisobga oladi.
                </p>
              </div>
              <div className="space-y-2">
                {OBSTACLES.map((o) => (
                  <OptionRow key={o} on={obstacle === o} onClick={() => setObstacle(o)}>
                    {o}
                  </OptionRow>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Smartphone className="size-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Telefon va gadjetlar</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Beshta qisqa savol — raqamli odatlaringizni baholaymiz.
                </p>
              </div>
              <div className="space-y-6">
                {PHONE_QUESTIONS.map((q, i) => (
                  <div key={q.key} className="space-y-2">
                    <p className="text-sm font-medium">
                      {i + 1}. {q.q}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((o) => (
                        <Chip
                          key={o}
                          on={phone[q.key] === o}
                          onClick={() => setPhone({ ...phone, [q.key]: o })}
                        >
                          {o}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Tana ko&apos;rsatkichlari</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mashq va ovqat tavsiyalari aynan shu raqamlarga tayanadi.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="age">Yosh</Label>
                  <Input
                    id="age"
                    type="number"
                    min={10}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="24"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Jins</Label>
                  <div className="flex gap-2">
                    {[
                      { v: "male", t: "Erkak" },
                      { v: "female", t: "Ayol" },
                    ].map((g) => (
                      <Chip key={g.v} on={gender === g.v} onClick={() => setGender(g.v)}>
                        {g.t}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="height">Bo&apos;y (sm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min={100}
                    max={250}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weight">Vazn (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min={30}
                    max={300}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Harakat darajasi</Label>
                {ACTIVITY.map((a) => (
                  <OptionRow key={a.v} on={activity === a.v} onClick={() => setActivity(a.v)}>
                    <span className="font-medium">{a.t}</span>
                    <span className="block text-xs text-muted-foreground">{a.d}</span>
                  </OptionRow>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex gap-3 pb-6">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => go(step - 1)}>
              <ArrowLeft className="mr-2 size-4" /> Orqaga
            </Button>
          )}
          {step < 4 ? (
            <Button className="group flex-1" onClick={() => go(step + 1)} disabled={!canNext}>
              Davom etish
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          ) : (
            <Button className="flex-1" onClick={finish} disabled={saving || !canNext}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Boshlash"}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
