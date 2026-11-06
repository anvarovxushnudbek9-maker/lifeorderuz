import * as React from "react";
import { ChevronDown } from "lucide-react";

const EXERCISES = [
  { name: "O‘tirib-turish (squat)", emoji: "🦵", reps: "3 × 12", steps: ["Oyoqlar yelka kengligida, barmoqlar biroz tashqariga.", "Tos suyagini orqaga surib, stulga o‘tirgandek pastga tushing.", "Tizzalar barmoq yo‘nalishida, orqa tekis.", "Tovonlar bilan itarib turing."] },
  { name: "Qo‘l bilan itarish (push-up)", emoji: "💪", reps: "3 × 8", steps: ["Kaftlar yelkadan biroz kengroq.", "Boshdan tovongacha bitta to‘g‘ri chiziq.", "Ko‘krak polga yaqinlashguncha tushing.", "Qiyin bo‘lsa — tizzada bajaring."] },
  { name: "Planka", emoji: "🧱", reps: "3 × 30 s", steps: ["Tirsaklar yelka ostida.", "Qorin va dumbani qisib turing.", "Bel pastga osilmasin, tos ko‘tarilmasin.", "Bir tekis nafas oling."] },
  { name: "Hamla (lunge)", emoji: "🚶", reps: "3 × 10 har oyoq", steps: ["Bir oyoq bilan katta qadam oldinga.", "Ikkala tizza ~90° bo‘lguncha tushing.", "Oldingi tizza barmoqdan oshmasin.", "Itarib qaytib, oyoqni almashtiring."] },
  { name: "Ko‘prik (glute bridge)", emoji: "🌉", reps: "3 × 15", steps: ["Chalqancha yoting, tizzalar bukilgan.", "Tovonlarga tayanib tosni ko‘taring.", "Tepada dumbani 1 soniya qising.", "Sekin pastga tushing."] },
  { name: "Joyida yugurish", emoji: "🏃", reps: "3 × 45 s", steps: ["Tizzalarni bel balandligiga ko‘taring.", "Qo‘llar faol harakatda.", "Oyoq uchida yumshoq qo‘ning.", "Nafas tiqilsa — tezlikni pasaytiring."] },
];

export function ExerciseGuide() {
  const [open, setOpen] = React.useState<string | null>(null);
  return <section className="mb-4 rounded-2xl border border-border bg-card p-4">
    <h2 className="text-sm font-semibold">Uskunasiz mashqlar — to‘g‘ri bajarish</h2>
    <p className="text-xs text-muted-foreground">Og‘riq bo‘lsa to‘xtating. 18 yoshgacha bo‘lsangiz og‘irlik qo‘shmang.</p>
    <div className="mt-3 space-y-2">{EXERCISES.map((e) => { const on = open === e.name; return <div key={e.name} className="rounded-xl border border-border">
      <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : e.name)} className="flex w-full items-center gap-3 px-3 py-2 text-left">
        <span className="text-2xl" aria-hidden>{e.emoji}</span><span className="flex-1 text-sm font-medium">{e.name}</span><span className="text-xs text-muted-foreground">{e.reps}</span><ChevronDown className={`size-4 transition-transform ${on ? "rotate-180" : ""}`} />
      </button>
      {on && <ol className="list-decimal space-y-1 px-8 pb-3 text-sm text-muted-foreground">{e.steps.map((s) => <li key={s}>{s}</li>)}</ol>}
    </div>; })}</div>
  </section>;
}
