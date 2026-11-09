import * as React from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiFetch } from "@/lib/ai-fetch";

const PROMPT =
  "Haftalik 'ko'r nuqtalar' auditini qil. Kunma-kun ma'lumotlarimga qarab: 1) qaysi hafta kunlarida reja ko'proq buziladi va bunga uyqu yoki suv bilan bog'liqlik bormi; 2) eng kuchli 2 ta qonuniyat; 3) eng katta 1 ta ko'r nuqta; 4) kelasi hafta uchun 3 ta aniq o'zgarish. Faqat raqamlarga tayan, ma'lumot yetmasa buni ochiq ayt.";

export function WeeklyReview({ highlight }: { highlight: boolean }) {
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setText("");
    try {
      const res = await aiFetch({ messages: [{ role: "user", content: PROMPT }] });
      if (!res.ok || !res.body) { setError(await res.text().catch(() => "AI xatosi")); return; }
      const reader = res.body.getReader(); const dec = new TextDecoder();
      for (;;) { const { done, value } = await reader.read(); if (done) break; setText((t) => t + dec.decode(value, { stream: true })); }
    } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }

  return (
    <section className={`rounded-2xl border bg-card p-5 ${highlight ? "border-primary" : "border-border"}`}>
      <h2 className="flex items-center gap-2 text-sm font-semibold"><CalendarCheck className="size-4 text-primary" />Haftalik ko‘r nuqtalar tahlili</h2>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p>
        : text ? <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
        : <p className="mt-3 text-sm text-muted-foreground">{highlight ? "Bugun yakshanba — haftani yakunlash vaqti. " : ""}Oxirgi 14 kunlik reja, uyqu va suv yozuvlaringizdan siz sezmagan qonuniyatlarni topadi.</p>}
      {!text && <Button className="mt-4 w-full" onClick={run} disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : "Haftani tahlil qilish"}</Button>}
    </section>
  );
}
