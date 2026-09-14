import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell, BookOpen, Users, CheckCircle2, Sparkles, LineChart } from "lucide-react";

import { Button } from "@/components/ui/button";

const TITLE = "O'SISH — shaxsiy rivojlanish ekosistemasi";
const DESC =
  "Tana, bilim, odatlar va davra — barcha shaxsiy rivojlanish modullaringiz bitta joyda. AI murabbiy bilan har kuni bir qadam oldinga.";

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

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <span className="text-sm font-bold tracking-tight">O&apos;SISH</span>
        <Link to="/auth">
          <Button size="sm">Kirish</Button>
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-5 pb-16 pt-12 text-center sm:pt-20">
        <p className="mb-4 inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          Shaxsiy rivojlanish ekosistemasi
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Har kuni bir foiz yaxshiroq bo&apos;lish uchun bitta tizim
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          Tana, bilim, odatlar va davra — rivojlanishning barcha modullari birlashgan joy. Yozib
          boring, tahlil qiling, natijani ko&apos;ring.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/auth">
            <Button size="lg">Bepul boshlash</Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <div
              key={m.title}
              className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <m.icon className="size-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-card-foreground">{m.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        O&apos;SISH — shaxsiy rivojlanish ekosistemasi
      </footer>
    </div>
  );
}
