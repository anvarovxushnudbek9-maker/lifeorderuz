import * as React from "react";
import { Pause, Play, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FocusTimer({ title, minutes, onClose, onComplete }: { title: string; minutes: number; onClose: () => void; onComplete: () => void }) {
  const duration = Math.max(1, minutes) * 60;
  const [remaining, setRemaining] = React.useState(duration);
  const [deadline, setDeadline] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (deadline === null) return;
    const tick = () => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (!next) setDeadline(null);
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);
  return <div role="dialog" aria-modal="true" aria-label="Fokus taymeri" className="fixed inset-0 z-[70] flex items-center justify-center bg-background/95 px-5 backdrop-blur">
    <div className="w-full max-w-md text-center">
      <Button size="icon" variant="ghost" onClick={onClose} aria-label="Fokusni yopish" className="mb-8"><X className="size-5" /></Button>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p role="timer" aria-live="off" className="my-8 text-6xl font-semibold tabular-nums">{String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}</p>
      <div className="flex justify-center gap-3">
        <Button size="icon" variant="outline" title="Qayta boshlash" aria-label="Taymerni tiklash" onClick={() => { setDeadline(null); setRemaining(duration); }}><RotateCcw className="size-5" /></Button>
        <Button disabled={remaining === 0} onClick={() => setDeadline(deadline === null ? Date.now() + remaining * 1000 : null)}>
          {deadline === null ? <Play className="size-4" /> : <Pause className="size-4" />}{deadline === null ? "Boshlash" : "Pauza"}
        </Button>
      </div>
      <Button variant="outline" className="mt-8" onClick={onComplete}>Vazifani bajardim</Button>
    </div>
  </div>;
}