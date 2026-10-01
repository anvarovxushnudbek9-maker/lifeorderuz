import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Dumbbell,
  BookOpen,
  Users,
  CheckCircle2,
  Sparkles,
  LineChart,
  ArrowRight,
  Flame,
  Moon,
  Target,
  Quote,
  ShieldCheck,
  Globe,
  Palette,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/hooks/useReveal";

const TITLE = "Life Order — motivatsiya tugaydi, tizim qoladi";
const DESC =
  "Tana, bilim, odatlar va davra — shaxsiy rivojlanishning barcha modullari bitta tizimda. AI murabbiy bilan har kuni bir qadam oldinga.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const MODULES = [
  {
    icon: Dumbbell,
    title: "Tana",
    text: "Mashq, ovqatlanish, uyqu, suv va vazn — jismoniy progressingiz bitta panelda.",
  },
  {
    icon: BookOpen,
    title: "Bilim",
    text: "Kitoblar va kurslar kutubxonasi, o'qilgan sahifalar va tugallangan darslar hisobi.",
  },
  {
    icon: CheckCircle2,
    title: "Odatlar",
    text: "Kunlik odatlar, ketma-ketlik (streak) va haftalik bajarilish foizi.",
  },
  {
    icon: Users,
    title: "Davra",
    text: "Maqsadi bir xil odamlar bilan guruhlarda suhbat va o'zaro qo'llab-quvvatlash.",
  },
  {
    icon: LineChart,
    title: "Analiz",
    text: "Barcha sohalar bo'yicha grafiklar, trendlar va haftalik hisobot.",
  },
  {
    icon: Sparkles,
    title: "AI murabbiy",
    text: "Ko'rsatkichlaringizni tahlil qilib, aniq tavsiya va reja beradigan suhbatdosh.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tizimni sozlang",
    text: "5 daqiqalik tanishuv: maqsad, odatlar, tana ko'rsatkichlari. Tizim sizga moslashadi.",
  },
  {
    n: "02",
    title: "Har kuni belgilang",
    text: "Bir tegish bilan odat, mashq, ovqat yoki kundalik yozuvi. Kuniga 30 soniya yetadi.",
  },
  {
    n: "03",
    title: "Natijani ko'ring",
    text: "Haftalik tahlil, streaklar va AI tavsiyalari — nima ishlayapti, nima yo'q.",
  },
];

const FEATURES = [
  {
    icon: Globe,
    title: "O'zbek tilida",
    text: "Barcha interfeys va AI murabbiy o'zbek tilida muloqot qiladi.",
  },
  {
    icon: Palette,
    title: "Zamonaviy dizayn",
    text: "Qorong'u va yorug' mavzular, chiroyli grafiklar va qulay boshqaruv.",
  },
  {
    icon: ShieldCheck,
    title: "Premium imkoniyatlar",
    text: "AI tahlil, cheksiz odatlar va guruhlarda ishtirok etish uchun maxsus reja.",
  },
];

const STATS = [
  { label: "Modul", value: 6, suffix: "" },
  { label: "Kunlik vaqt", value: 30, suffix: " son." },
  { label: "Tahlil", value: 7, suffix: " kun" },
];

function useCountUp(target: number, run: boolean) {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    if (!run) return;
    let frame = 0;
    const total = 40;
    const id = setInterval(() => {
      frame += 1;
      setValue(Math.round((target * frame) / total));
      if (frame >= total) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [target, run]);
  return value;
}

const PLANS = [
  {
    name: "Bepul",
    price: "0",
    period: "so'm",
    note: "Tizimni boshlash uchun hamma asosiy narsa.",
    highlight: false,
    cta: "Bepul boshlash",
    items: [
      "5 ta modul: Tana, Bilim, Odat, Davra, Kundalik",
      "3 tagacha faol odat",
      "Kaloriya va makro hisob-kitobi",
      "Kuniga 5 ta AI savol",
      "Sayt ichidagi eslatmalar",
    ],
  },
  {
    name: "Premium",
    price: "49 000",
    period: "so'm / oy",
    note: "Hayotingizni to'liq boshqarish uchun shaxsiy tizim.",
    highlight: true,
    cta: "7 kun bepul sinash",
    items: [
      "Cheksiz odatlar va maqsadlar",
      "Cheksiz AI murabbiy + haftalik shaxsiy tahlil",
      "AI tuzgan kun tartibi, ovqat va mashq rejasi",
      "Telegram va email eslatmalar",
      "Chuqur analitika: trendlar, seriyalar, hisobotlar",
      "Cheksiz davralar va jamoaviy challenge'lar",
      "Ma'lumotlarni eksport qilish",
    ],
  },
] as const;

function StatCard({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  const [run, setRun] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const n = useCountUp(value, run);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRun(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => e[0]?.isIntersecting && (setRun(true), io.disconnect()),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="rounded-2xl border border-border bg-card p-6 text-center">
      <div className="text-3xl font-bold tracking-tight text-gradient">
        {n}
        {suffix}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <span className="text-sm font-bold tracking-[0.2em]">Life Order</span>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#modullar" className="transition-colors hover:text-foreground">
              Modullar
            </a>
            <a href="#premium" className="transition-colors hover:text-foreground">
              Premium
            </a>
            <a href="#ai" className="transition-colors hover:text-foreground">
              AI murabbiy
            </a>
          </nav>
          <Link to="/auth">
            <Button size="sm">Kirish</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl px-5 pb-20 pt-16 text-center sm:pt-24">
          <Reveal className="inline-flex">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              <Flame className="size-3.5 text-primary" />
              Shaxsiy rivojlanish ekosistemasi
            </p>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-7xl">
              Motivatsiya tugaydi.
              <br />
              <span className="text-gradient animate-sheen">Tizim qoladi.</span>
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-xl">
              Tana, bilim, odatlar va davra — rivojlanishning barcha modullari birlashgan joy. 
              To'liq o'zbek tilida, AI murabbiy bilan tizimli o'sish.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/auth">
                <Button size="lg" className="group w-full sm:w-auto">
                  Bepul boshlash
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="#modullar">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Modullarni ko&apos;rish
                </Button>
              </a>
            </div>
          </Reveal>

          <Reveal delay={340}>
            <div className="mx-auto mt-14 max-w-md rounded-3xl border border-border bg-card p-5 text-left shadow-elegant animate-float">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Bugungi tizim</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  12 kun streak
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { icon: Dumbbell, label: "Ertalabki mashq", pct: 100 },
                  { icon: BookOpen, label: "30 daqiqa kitob", pct: 70 },
                  { icon: Moon, label: "Erta uyqu", pct: 45 },
                ].map((row) => (row &&
                  <div key={row.label}>
                    <div className="mb-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                      <row.icon className="size-4 text-primary" />
                      {row.label}
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full gradient-primary"
                        style={{ width: `${row.pct}%`, animation: "osish-progress 1.2s ease-out" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-4xl px-5 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <StatCard {...s} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modullar" className="mx-auto max-w-7xl scroll-mt-20 px-5 pb-24">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Bitta ilova, olti modul</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-muted-foreground">
            Har bir soha alohida ilova emas — bitta tizimning bo&apos;laklari. Shuning uchun ular
            bir-birini kuchaytiradi.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <Reveal key={m.title} delay={i * 70}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 hover-lift">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                  <m.icon className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{m.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features/Premium Info */}
      <section id="premium" className="mx-auto max-w-7xl scroll-mt-20 px-5 pb-24">
        <div className="grid gap-12 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/5">
                  <f.icon className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <h2 className="mt-24 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Oddiy va ochiq narxlar
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Bepul boshlang. Tizim ishlayotganini his qilganingizda Premiumga o'ting.
          </p>
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 120}>
              <div
                className={
                  p.highlight
                    ? "relative h-full rounded-2xl border-2 border-primary bg-card p-7 shadow-lg"
                    : "h-full rounded-2xl border border-border bg-card p-7"
                }
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    Eng foydali
                  </span>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-3">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-sm text-muted-foreground"> {p.period}</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{p.note}</p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className={
                    p.highlight
                      ? "mt-7 block rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                      : "mt-7 block rounded-xl border border-border py-3 text-center text-sm font-semibold transition-colors hover:bg-accent"
                  }
                >
                  {p.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          7 kunlik bepul sinov · Istalgan vaqtda bekor qilish · Ma'lumotlaringiz faqat sizniki
        </p>
      </section>

      {/* How it works */}
      <section id="qanday" className="scroll-mt-20 border-y border-border bg-secondary/40 py-24">
        <div className="mx-auto max-w-5xl px-5">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight">Uch qadamda tizim</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="relative rounded-2xl border border-border bg-card p-8">
                  <span className="text-xs font-bold tracking-widest text-primary">{s.n}</span>
                  <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI */}
      <section id="ai" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-24">
        <div className="grid items-center gap-16 sm:grid-cols-2">
          <Reveal>
            <div>
              <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl gradient-primary">
                <Sparkles className="size-7 text-primary-foreground" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight">Sizni biladigan murabbiy</h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                AI murabbiy sizning mashqlaringiz, uyqungiz, o&apos;qigan kitoblaringiz va odatlaringizni
                ko&apos;radi. U umumiy maslahat bermaydi — aynan sizning raqamlaringizga qarab keyingi
                qadamni aytadi.
              </p>
              <ul className="mt-6 space-y-3 text-sm sm:text-base">
                {[
                  "Haftalik tahlil va zaif nuqtalar",
                  "Reja va maqsadlarni bo'laklarga bo'lish",
                  "O'zbek tilida, qisqa va amaliy",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary" />
                    <span className="text-muted-foreground">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-elegant">
              <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                Shu hafta nima yaxshi ketmadi?
              </div>
              <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm">
                Uyqu: 5 kun 6 soatdan kam. Mashq esa 4/4 bajarilgan. Ertaga 23:00 da chiroqni
                o&apos;chirishni odatlarga qo&apos;shaylikmi?
              </div>
              <div className="w-fit rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quote */}
      <section className="border-y border-border bg-secondary/40 py-24">
        <Reveal className="mx-auto max-w-3xl px-5 text-center">
          <Quote className="mx-auto size-8 text-primary" />
          <p className="mt-6 text-2xl font-medium leading-relaxed sm:text-3xl">
            &ldquo;Siz maqsadlaringiz darajasiga ko&apos;tarilmaysiz — tizimingiz darajasiga
            tushasiz.&rdquo;
          </p>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-5 py-24 text-center">
        <Reveal>
          <Target className="mx-auto size-10 text-primary" />
          <h2 className="mt-6 text-4xl font-bold tracking-tight">Bugundan boshlang</h2>
          <p className="mt-4 text-base text-muted-foreground">
            Bir necha savol — va tizimingiz tayyor. Bepul sinab ko'ring yoki Premium imkoniyatlarni o'rganing.
          </p>
          <Link to="/auth" className="mt-10 inline-block w-full sm:w-auto">
            <Button size="lg" className="group w-full sm:w-auto">
              Hisob yaratish
              <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-border py-12 text-center text-sm text-muted-foreground">
        Life Order — motivatsiya tugaydi, tizim qoladi
      </footer>
    </div>
  );
}
