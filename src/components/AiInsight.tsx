import * as React from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { aiFetch } from "@/lib/ai-fetch";

export function AiInsight({ context }: { context: string }) {
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const run = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setText("");
    try {
      const res = await aiFetch({
        context,
        messages: [
          {
            role: "user",
            content:
              "Quyidagi ko'rsatkichlarim asosida qisqa tahlil qil. 3 ta kuchli tomon, 2 ta zaif nuqta va bugun bajarish uchun 3 ta aniq qadam ber. Umumiy gaplar emas, raqamlarga tayan.",
          },
        ],
      });
      if (!res.ok || !res.body) {
        setError(await res.text().catch(() => "AI xatosi"));
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((t) => t + dec.decode(value, { stream: true }));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [context]);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" />
          AI tahlil
        </h2>
        <Button size="sm" variant="ghost" onClick={run} disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
        </Button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      ) : text ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          {loading
            ? "Ko'rsatkichlaringiz tahlil qilinmoqda…"
            : "BMI, kaloriya, oqsil, odat va davra ko'rsatkichlaringiz bo'yicha shaxsiy tahlil oling."}
        </p>
      )}

      {!text && !loading && (
        <Button className="mt-4 w-full" onClick={run}>
          Tahlil qilish
        </Button>
      )}
    </section>
  );
}
