import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Dumbbell,
  BookOpen,
  Users,
  CheckCircle2,
  Sparkles,
  NotebookPen,
  ArrowRight,
  Moon,
  Sun,
  Globe,
  Check,
  Flame,
  ShieldCheck,
  CalendarX,
  Layers,
  Smartphone,
  Quote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Reveal } from "@/hooks/useReveal";
import { useTheme } from "@/hooks/useTheme";
import { Logo } from "@/components/Logo";
import { LANDING, LANGS, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TITLE = "Life Order — motivatsiya tugaydi, tizim qoladi";
const DESC =
  "Har kuni siz uchun tuzilgan 3 ta aniq qadam. Tana, bilim, odatlar va davra — bitta tizimda, AI murabbiy bilan. Bepul boshlang.";

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

const MODULE_ICONS = [Dumbbell, BookOpen, CheckCircle2, Users, NotebookPen, Sparkles];
const PROBLEM_ICONS = [CalendarX, Layers, Smartphone];
const TODAY_ICONS = [Dumbbell, BookOpen, Moon];

function TodayCard({ title, items, streak }: { title: string; items: string[]; streak: string }) {
  const [done, setDone] = React.useState<boolean[]>([true, false, false]);
  const count = done.filter(Boolean).length;
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-border bg-card p-5 text-left shadow-elegant animate-float">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{title}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          <Flame className="size-3.5" /> {streak}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((label, i) => {
          const Icon = TODAY_ICONS[i]!;
          const on = done[i];
          return (
            <button
              key={label}
              type="button"
              onClick={() => setDone(done.map((d, j) => (j === i ? !d : d)))}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all active:scale-[0.98]",
                on ? "border-primary/40 bg-primary/5" : "border-border hover:bg-accent",
              )}
            >
              <Icon className="size-4 text-primary" />
              <span className={cn("flex-1 text-left", on && "text-muted-foreground line-through")}>{label}</span>
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border transition-colors",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
              >
                {on && <Check className="size-3" />}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full gradient-primary transition-all duration-500" style={{ width: `${(count / 3) * 100}%` }} />
      </div>
      <p className="mt-2 text-right text-xs text-muted-foreground">{count}/3</p>
    </div>
  );
}

function Landing() {
  const { lang, setLang } = useLang();
  const { theme, toggle } = useTheme();
  const t = LANDING[lang];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5">
          <a href="#top" aria-label="Life Order">
            <Logo />
          </a>
          <nav className="ml-8 hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#qanday" className="transition-colors hover:text-foreground">{t.nav.how}</a>
            <a href="#modullar" className="transition-colors hover:text-foreground">{t.nav.modules}</a>
            <a href="#narxlar" className="transition-colors hover:text-foreground">{t.nav.pricing}</a>
            <a href="#savollar" className="transition-colors hover:text-foreground">{t.nav.faq}</a>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5" aria-label="Til">
                  <Globe className="size-4" />
                  <span className="hidden sm:inline">{LANGS.find((l) => l.v === lang)?.label}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGS.map((l) => (
                  <DropdownMenuItem key={l.v} onClick={() => setLang(l.v)}>
                    {l.label}
                    {l.v === lang && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Rejimni almashtirish">
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Link to="/auth" className="ml-1">
              <Button size="sm">{t.nav.login}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.15fr_1fr]">
          <div className="text-center lg:text-left">
            <Reveal className="inline-flex">
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                {t.badge}
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                {t.h1a}
                <br />
                <span className="text-gradient animate-sheen">{t.h1b}</span>
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                {t.sub}
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button size="lg" className="group h-12 w-full px-7 text-base sm:w-auto">
                    {t.cta}
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <a href="#qanday" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="h-12 w-full sm:w-auto">
                    {t.secondary}
                  </Button>
                </a>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{t.ctaNote}</p>
            </Reveal>
            <Reveal delay={320}>
              <p className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" /> {t.proof}
              </p>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <TodayCard title={t.todayTitle} items={t.todayItems} streak={t.streak} />
          </Reveal>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t.problemTitle}</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {t.problems.map((p, i) => {
            const Icon = PROBLEM_ICONS[i]!;
            return (
              <Reveal key={p.t} delay={i * 90}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <Icon className="size-6 text-muted-foreground" />
                  <h3 className="mt-4 font-semibold">{p.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* How */}
      <section id="qanday" className="scroll-mt-20 border-y border-border bg-secondary/40 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t.howTitle}</h2>
          </Reveal>
          <div className="relative mt-12 grid gap-6 md:grid-cols-3">
            <div aria-hidden className="absolute left-0 right-0 top-9 hidden h-px bg-border md:block" />
            {t.how.map((s, i) => (
              <Reveal key={s.t} delay={i * 110}>
                <div className="relative h-full rounded-2xl border border-border bg-card p-7 hover-lift">
                  <span className="flex size-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modullar" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t.modulesTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{t.modulesSub}</p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.modules.map((m, i) => {
            const Icon = MODULE_ICONS[i]!;
            return (
              <Reveal key={m.t} delay={i * 60}>
                <div className="group h-full rounded-2xl border border-border bg-card p-6 hover-lift">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{m.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Voices */}
      <section className="border-y border-border bg-secondary/40 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t.voicesTitle}</h2>
            <p className="mt-2 text-center text-xs text-muted-foreground">{t.voicesNote}</p>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {t.voices.map((v, i) => (
              <Reveal key={v.name} delay={i * 90}>
                <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                  <Quote className="size-5 text-primary" />
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed">{v.text}</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {v.name[0]}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{v.name}</span>
                      <span className="block text-xs text-muted-foreground">{v.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="narxlar" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-24">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t.pricingTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{t.pricingSub}</p>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-card p-7">
              <h3 className="text-lg font-semibold">{t.free.name}</h3>
              <p className="mt-3">
                <span className="text-4xl font-bold">0</span>
                <span className="text-sm text-muted-foreground"> {t.premium.period.split(" ")[0]}</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{t.free.note}</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {t.free.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {it}
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="mt-7 block">
                <Button variant="outline" className="w-full">{t.free.cta}</Button>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative h-full rounded-2xl border-2 border-primary bg-card p-7 shadow-elegant">
              <span className="absolute -top-3 left-7 rounded-full gradient-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                {t.best}
              </span>
              <h3 className="text-lg font-semibold">{t.premium.name}</h3>
              <p className="mt-3">
                <span className="text-4xl font-bold">49 000</span>
                <span className="text-sm text-muted-foreground"> {t.premium.period}</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{t.premium.note}</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {t.premium.items.map((it, i) => (
                  <li key={it} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      {it}
                      {i === t.premium.items.length - 1 && (
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {t.premium.soon}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="mt-7 block">
                <Button className="w-full">{t.premium.cta}</Button>
              </Link>
            </div>
          </Reveal>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">{t.guarantee}</p>
      </section>

      {/* FAQ */}
      <section id="savollar" className="mx-auto max-w-3xl scroll-mt-20 px-5 pb-24">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t.faqTitle}</h2>
        </Reveal>
        <Accordion type="single" collapsible className="mt-8">
          {t.faq.map((f, i) => (
            <AccordionItem key={f.q} value={`q${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-24">
        <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-elegant">
          <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-5xl">{t.finalTitle}</h2>
          <p className="relative mt-4 text-muted-foreground">{t.finalSub}</p>
          <Link to="/auth" className="relative mt-8 inline-block">
            <Button size="lg" className="group h-12 px-8 text-base">
              {t.cta}
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">{t.footer}</p>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Life Order</p>
        </div>
      </footer>
    </div>
  );
}
