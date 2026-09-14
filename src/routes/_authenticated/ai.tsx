import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { todayISO, lastNDays } from "@/lib/date";

const TITLE = "AI murabbiy — O'SISH";
const DESC = "Ko'rsatkichlaringizni tahlil qilib, kunlik tavsiya va reja beradigan AI murabbiy.";

export const Route = createFileRoute("/_authenticated/ai")({
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
  component: AiCoach,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Bugungi ko'rsatkichlarimni tahlil qil",
  "Menga haftalik reja tuzib ber",
  "Odatlarimni qanday mustahkamlayman?",
  "Mashq dasturimni yaxshilash bo'yicha maslahat ber",
];

function AiCoach() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  const { data: context } = useQuery({
    queryKey: ["ai-context", uid],
    enabled: !!uid,
    queryFn: async () => {
      const week = lastNDays(7);
      const [habits, logs, workouts, books, metrics] = await Promise.all([
        supabase.from("habits").select("title,target_per_week").eq("user_id", uid),
        supabase.from("habit_logs").select("log_date").eq("user_id", uid).gte("log_date", week[0]!),
        supabase.from("workouts").select("title,duration_min").eq("user_id", uid).gte("performed_on", week[0]!),
        supabase.from("books").select("title,current_page,total_pages").eq("user_id", uid),
        supabase.from("body_metrics").select("*").eq("user_id", uid).eq("metric_date", todayISO()).maybeSingle(),
      ]);
      const lines = [
        `Odatlar: ${(habits.data ?? []).map((h) => h.title).join(", ") || "yo'q"}`,
        `Oxirgi 7 kunda bajarilgan odat belgilari: ${logs.data?.length ?? 0}`,
        `Haftalik mashqlar: ${(workouts.data ?? []).map((w) => `${w.title} (${w.duration_min} daq)`).join(", ") || "yo'q"}`,
        `Kitoblar: ${(books.data ?? []).map((b) => `${b.title} ${b.current_page}/${b.total_pages}`).join(", ") || "yo'q"}`,
        `Bugun: uyqu ${metrics.data?.sleep_hours ?? "-"} soat, suv ${metrics.data?.water_ml ?? 0} ml, qadam ${metrics.data?.steps ?? 0}`,
      ];
      return lines.join("\n");
    },
  });

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const next: Msg[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setMessages([...next, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, context }),
      });
      if (!res.ok || !res.body) {
        throw new Error(await res.text());
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
      if (uid && acc) {
        await supabase.from("ai_messages").insert([
          { user_id: uid, role: "user", content: text.trim() },
          { user_id: uid, role: "assistant", content: acc },
        ]);
      }
    } catch (err) {
      toast.error((err as Error).message || "AI javob bera olmadi");
      setMessages(next);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-11rem)] flex-col">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold">AI murabbiy</h1>
          <p className="text-xs text-muted-foreground">Tahlil qiladi, reja tuzadi, yo&apos;naltiradi.</p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Nimadan boshlaymiz?</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
                  {m.content}
                </div>
              ) : (
                <div className="max-w-full whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {m.content || (streaming ? "O'ylanmoqda..." : "")}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form
        className="sticky bottom-20 mt-4 flex items-end gap-2 bg-background py-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <Textarea
          rows={1}
          className="min-h-11 resize-none"
          placeholder="Savolingizni yozing..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
        />
        <Button type="submit" size="icon" className="shrink-0" disabled={streaming} aria-label="Yuborish">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
