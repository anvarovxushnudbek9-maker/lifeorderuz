import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Target } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { todayISO } from "@/lib/date";

export function TopThree() {
  const { user } = useAuth(); const uid = user?.id ?? ""; const today = todayISO();
  const qc = useQueryClient(); const key = ["top_tasks", uid, today];
  const { data = [] } = useQuery({ queryKey: key, enabled: !!uid, queryFn: async () => (await supabase.from("top_tasks").select("*").eq("user_id", uid).eq("task_date", today).order("position")).data ?? [] });
  const save = useMutation({
    mutationFn: async (v: { position: number; title?: string; done?: boolean }) => {
      const cur = data.find((t) => t.position === v.position);
      const title = (v.title ?? cur?.title ?? "").trim();
      if (!title) { if (cur) await supabase.from("top_tasks").delete().eq("id", cur.id); return; }
      const { error } = await supabase.from("top_tasks").upsert({ user_id: uid, task_date: today, position: v.position, title, done: v.done ?? cur?.done ?? false }, { onConflict: "user_id,task_date,position" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: (e: Error) => toast.error(e.message),
  });
  const done = data.filter((t) => t.done).length;
  return <section className="rounded-2xl border border-border bg-card p-5" data-tour="top3">
    <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-semibold"><Target className="size-4 text-primary" />Bugungi 3 ta asosiy ish</h2><span className="text-sm text-muted-foreground">{done}/3</span></div>
    <p className="mt-1 text-xs text-muted-foreground">Faqat 3 ta. Shular bajarilsa — kun yutuq.</p>
    <div className="mt-3 space-y-2">{[1, 2, 3].map((n) => { const t = data.find((x) => x.position === n); return <Row key={`${n}-${t?.id ?? "new"}-${t?.title ?? ""}`} n={n} title={t?.title ?? ""} done={!!t?.done} onSave={(title) => save.mutate({ position: n, title })} onToggle={() => t && save.mutate({ position: n, done: !t.done })} />; })}</div>
  </section>;
}

function Row({ n, title, done, onSave, onToggle }: { n: number; title: string; done: boolean; onSave: (t: string) => void; onToggle: () => void }) {
  const [v, setV] = React.useState(title);
  return <div className="flex items-center gap-2">
    <button type="button" aria-label={`${n}-ishni bajarildi deb belgilash`} disabled={!title} onClick={onToggle} className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>{done ? <Check className="size-4" /> : n}</button>
    <Input value={v} maxLength={200} placeholder={`${n}-muhim ish`} className={done ? "line-through text-muted-foreground" : ""} onChange={(e) => setV(e.target.value)} onBlur={() => v.trim() !== title && onSave(v)} onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()} />
  </div>;
}
