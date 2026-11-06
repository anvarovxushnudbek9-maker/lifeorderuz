import * as React from "react";
import { Button } from "@/components/ui/button";

const STEPS = [
  ["Xush kelibsiz!", "Life Order — motivatsiya emas, tizim. Har kuni bir xil oddiy halqa: reja → bajarish → xulosa."],
  ["3 ta asosiy ish", "Ertalab faqat 3 ta muhim ishni yozing. Ular bajarilsa — kun yutuq."],
  ["Soatbay jadval va fokus", "Ishlarni soatlarga joylang, fokus taymerini fon tovushi bilan ishga tushiring."],
  ["Tana, Bilim, Odat, Davra", "Pastki menyu orqali suv, uyqu, kitoblar, odatlar va hamkoringizga o‘ting."],
  ["Kechqurun xulosa", "Kun oxirida 1 daqiqalik xulosa yozing. Ertangi reja shunga moslashadi."],
] as const;
const KEY = "lo_tour_done_v1";

export function AppTour() {
  const [step, setStep] = React.useState<number | null>(null);
  React.useEffect(() => { if (!localStorage.getItem(KEY)) setStep(0); }, []);
  if (step === null) return null;
  const done = () => { localStorage.setItem(KEY, "1"); setStep(null); };
  const [t, d] = STEPS[step]!;
  return <div role="dialog" aria-modal="true" aria-label="Tanishtiruv" className="fixed inset-0 z-[80] flex items-end justify-center bg-background/70 p-4 backdrop-blur-sm sm:items-center">
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
      <p className="text-xs text-muted-foreground">{step + 1}/{STEPS.length}</p>
      <h2 className="mt-1 text-lg font-semibold">{t}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{d}</p>
      <div className="mt-5 flex justify-between"><Button variant="ghost" size="sm" onClick={done}>O‘tkazib yuborish</Button>
        <Button size="sm" onClick={() => (step + 1 < STEPS.length ? setStep(step + 1) : done())}>{step + 1 < STEPS.length ? "Keyingi" : "Boshlash"}</Button></div>
    </div>
  </div>;
}
