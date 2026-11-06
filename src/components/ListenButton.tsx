import * as React from "react";
import { Headphones, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Reads a summary aloud with the device's built-in voice (no AI credits). */
export function ListenButton({ text }: { text: string }) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => () => { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); }, []);
  if (typeof window !== "undefined" && !("speechSynthesis" in window)) return null;
  function toggle() {
    const synth = window.speechSynthesis;
    if (on) { synth.cancel(); setOn(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const v = voices.find((x) => x.lang.startsWith("uz")) ?? voices.find((x) => x.lang.startsWith("tr")) ?? voices.find((x) => x.lang.startsWith("ru"));
    if (v) u.voice = v;
    u.rate = 0.95;
    u.onend = () => setOn(false);
    synth.cancel(); synth.speak(u); setOn(true);
  }
  return <Button size="sm" variant="outline" onClick={toggle}>{on ? <Square className="size-4" /> : <Headphones className="size-4" />}{on ? "To‘xtatish" : "Tinglash (audio xulosa)"}</Button>;
}
