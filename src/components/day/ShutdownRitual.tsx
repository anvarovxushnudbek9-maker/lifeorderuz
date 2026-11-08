import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, MoonStar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { todayISO } from "@/lib/date";
import { SHUTDOWN_CARRY, SHUTDOWN_DROP, freeTopPosition, isShutdownTime, tomorrowISO } from "@/lib/life-os";

type Open = { kind: "plan" | "top"; id: string; title: string; position?: number };

export function ShutdownRitual() {
  const { user } = useAuth(); const uid = user?.id ?? ""; const today = todayISO(); const qc = useQueryClient();
  const [hour, setHour] = React.useState<number | null>(null);
  const [open, setOpen] = React.useState(false);
  const [calm, setCalm] = React.useState(false);
  React.useEffect(() => { const t = () => setHour(new Date().getHours()); t(); const i = setInterval(t, 60000); return () => clearInterval(i); }, []);
  const key = ["shutdown", uid, today];
  const { data } = useQuery({
    queryKey: key, enabled: !!uid && hour !== null && isShutdownTime(hour),
    queryFn: async () => {
      const [plan, top, chk] = await Promise.all([
        supabase.from("daily_plan_items").select("id,title,status").eq("user_id", uid).eq("plan_date", today).order("position"),
        supabase.from("top_tasks").select("id,title,done,position").eq("user_id", uid).eq("task_date", today).order("position"),
        supabase.from("daily_checkins").select("closed_at").eq("user_id", uid).eq("checkin_date", today).maybeSingle(),
      ]);
      for (const r of [plan, top, chk]) if (r.error) throw r.error;
      const done = [...(top.data ?? []).filter((t) => t.done).map((t) => t.title), ...(plan.data ?? []).filter((p) => p.status === "done").map((p) => p.title)];
      const pending: Open[] = [
        ...(top.data ?? []).filter((t) => !t.done).map((t) => ({ kind: "top" as const, id: t.id, title: t.title, position: t.position })),
        ...(plan.data ?? []).filter((p) => p.status === "todo").map((p) => ({ kind: "plan" as const, id: p.id, title: p.title })),
      ];
      return { done, pending, closed: !!chk.data?.closed_at };
    },
  });
  const refresh = () => { void qc.invalidateQueries({ queryKey: key }); void qc.invalidateQueries({ queryKey: ["life-engine", uid, today] }); void qc.invalidateQueries({ queryKey: ["top_tasks", uid, today] }); };
  const resolve = useMutation({
    mutationFn: async ({ item, action }: { item: Open; action: "carry" | "drop" }) => {
      if (item.kind === "plan") {
        const { error } = await supabase.from("daily_plan_items").update({ status: action === "carry" ? "postponed" : "skipped", skip_reason: action === "carry" ? SHUTDOWN_CARRY : SHUTDOWN_DROP }).eq("id", item.id);
        if (error) throw error; return;
      }
      if (action === "carry") {
        const tomorrow = tomorrowISO();
        const { data: tmr, error: e1 } = await supabase.from("top_tasks").select("position").eq("user_id", uid).eq("task_date", tomorrow);
        if (e1) throw e1;
        const pos = freeTopPosition((tmr ?? []).map((t) => t.position));
        if (pos === null) throw new Error("Ertangi 3 ta asosiy ish allaqachon to‘la.");
        const { error } = await supabase.from("top_tasks").insert({ user_id: uid, task_date: tomorrow, position: pos, title: item.title });
        if (error) throw error;
      }
      const { error } = await supabase.from("top_tasks").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: refresh, onError: (e: Error) => toast.error(e.message),
  });
  const close = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("daily_checkins").upsert({ user_id: uid, checkin_date: today, closed_at: new Date().toISOString() }, { onConflict: "user_id,checkin_date" });
      if (error) throw error;
    },
    onSuccess: () => { refresh(); setOpen(false); setCalm(true); }, onError: (e: Error) => toast.error(e.message),
  });

  if (hour === null || !isShutdownTime(hour) || !data) return null;
  return <>
    {data.closed ? (
      <p className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground"><MoonStar className="size-4 text-primary" />Kun yopilgan. Miyangizga dam bering — ertaga yangi kun.</p>
    ) : (
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4" aria-label="Kunni yopish">
        <div><p className="flex items-center gap-2 text-sm font-semibold"><MoonStar className="size-4 text-primary" />Kunni rasman yopish</p><p className="mt-0.5 text-xs text-muted-foreground">2 daqiqa: bajarilganini ko‘ring, chala ishlarni joyiga qo‘ying.</p></div>
        <Button size="sm" onClick={() => setOpen(true)}>Kunni yopish</Button>
      </section>
    )}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Kunni yopish</DialogTitle><DialogDescription>Chala ishlar miyada qolmasin — har biriga qaror bering.</DialogDescription></DialogHeader>
        <div>
          <p className="text-sm font-semibold">Bugun bajarildi ({data.done.length})</p>
          {data.done.length ? <ul className="mt-2 space-y-1">{data.done.map((t, i) => <li key={i} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{t}</li>)}</ul>
            : <p className="mt-1 text-xs text-muted-foreground">Bugun belgilangan ish yo‘q. Kunni yopish ham — intizom.</p>}
          {data.done.length > 0 && <p className="mt-2 text-xs text-primary">Yaxshi ish. Har bir yopilgan ish — tizimga qo‘shilgan g‘isht.</p>}
        </div>
        <div className="mt-2">
          <p className="text-sm font-semibold">Chala qolgan ({data.pending.length})</p>
          {data.pending.length === 0 ? <p className="mt-1 text-xs text-muted-foreground">Hammasi hal qilingan.</p> :
            <ul className="mt-2 space-y-2">{data.pending.map((it) => <li key={it.id} className="rounded-xl border border-border p-3">
              <p className="text-sm">{it.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled={resolve.isPending} onClick={() => resolve.mutate({ item: it, action: "carry" })}><ArrowRight className="size-4" />Ertaga ko‘chirish</Button>
                <Button size="sm" variant="ghost" disabled={resolve.isPending} onClick={() => resolve.mutate({ item: it, action: "drop" })}><Trash2 className="size-4" />Rejadan o‘chirish</Button>
              </div>
            </li>)}</ul>}
        </div>
        <Button className="mt-2 w-full" disabled={close.isPending || data.pending.length > 0} onClick={() => close.mutate()}>{data.pending.length > 0 ? "Avval chala ishlarni hal qiling" : "Kunni yopish"}</Button>
      </DialogContent>
    </Dialog>
    {calm && (
      <div role="dialog" aria-modal="true" aria-label="Kun yopildi" className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-background/95 p-8 text-center backdrop-blur-sm animate-in fade-in duration-700">
        <MoonStar className="size-10 text-primary" />
        <p className="max-w-sm text-xl font-semibold">Kun yopildi.</p>
        <p className="max-w-sm text-muted-foreground">Endi miyangga dam ber va ekranlarni o‘chir.</p>
        <Button variant="outline" onClick={() => setCalm(false)}>Yopish</Button>
      </div>
    )}
  </>;
}
