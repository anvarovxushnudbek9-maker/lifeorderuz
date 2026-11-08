import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lastNDays } from "@/lib/date";
import { distractionMap } from "@/lib/day-rules";
import { BREACH_XP, RECOVERY_TASKS } from "@/lib/life-os";

const SOURCES = ["Instagram", "TikTok", "YouTube", "Telegram", "O‘yinlar", "Boshqa"];

export function DopamineMap() {
  const { user } = useAuth(); const uid = user?.id ?? ""; const from = lastNDays(7)[0]!; const qc = useQueryClient();
  const key = ["distractions", uid, from]; const pKey = ["dopamine-triggers", uid];
  const [source, setSource] = React.useState(SOURCES[0]!); const [min, setMin] = React.useState("15");
  const { data = [] } = useQuery({ queryKey: key, enabled: !!uid, queryFn: async () => {
    const r = await supabase.from("distraction_logs").select("id,source,minutes,breach,recovery,recovered_at,created_at").eq("user_id", uid).gte("logged_on", from).order("created_at", { ascending: false });
    if (r.error) throw r.error; return r.data ?? [];
  } });
  const { data: triggers = [] } = useQuery({ queryKey: pKey, enabled: !!uid, queryFn: async () => {
    const r = await supabase.from("profiles").select("dopamine_triggers").eq("id", uid).maybeSingle();
    if (r.error) throw r.error; return (r.data?.dopamine_triggers ?? []) as string[];
  } });
  const done = () => { void qc.invalidateQueries({ queryKey: key }); void qc.invalidateQueries({ queryKey: ["achievements"] }); };
  const add = useMutation({
    mutationFn: async (v: { source: string; minutes: number; breach: boolean }) => { if (!(v.minutes >= 1 && v.minutes <= 1440)) throw new Error("Daqiqani 1–1440 oralig‘ida kiriting"); const { error } = await supabase.from("distraction_logs").insert({ user_id: uid, source: v.source, minutes: v.minutes, breach: v.breach }); if (error) throw error; },
    onSuccess: (_d, v) => { done(); toast.success(v.breach ? "Halol tan olindi. Endi tiklanish intizomi." : "Yozildi — halollik birinchi qadam"); }, onError: (e: Error) => toast.error(e.message),
  });
  const recover = useMutation({
    mutationFn: async (v: { id: string; task: string }) => { const { error } = await supabase.from("distraction_logs").update({ recovery: v.task, recovered_at: new Date().toISOString() }).eq("id", v.id); if (error) throw error; },
    onSuccess: () => { done(); toast.success(`Tiklandi: +${BREACH_XP} XP qaytdi`); }, onError: (e: Error) => toast.error(e.message),
  });
  const setTriggers = useMutation({
    mutationFn: async (next: string[]) => { const { error } = await supabase.from("profiles").update({ dopamine_triggers: next }).eq("id", uid); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: pKey }), onError: (e: Error) => toast.error(e.message),
  });
  const toggleTrigger = (s: string) => {
    if (triggers.includes(s)) return setTriggers.mutate(triggers.filter((t) => t !== s));
    if (triggers.length >= 2) return toast.error("Faqat 1–2 ta asosiy chalg‘ituvchini tanlang");
    setTriggers.mutate([...triggers, s]);
  };
  const pending = data.filter((d) => d.breach && !d.recovered_at);
  const map = distractionMap(data); const total = map.reduce((s, x) => s + x.minutes, 0); const max = map[0]?.minutes ?? 1;
  return <section className="rounded-2xl border border-border bg-card p-5">
    <h2 className="flex items-center gap-2 text-base font-semibold"><ShieldAlert className="size-4 text-primary" />Dopamin qafasi</h2>
    <p className="mt-1 text-xs text-muted-foreground">Eng ko‘p chalg‘itadigan 1–2 tasini tanlang. Qoida buzilsa — tanbeh emas, tiklanish.</p>
    <div className="mt-3 flex flex-wrap gap-1.5">{SOURCES.map((s) => <Button key={s} size="sm" type="button" variant={triggers.includes(s) ? "default" : "outline"} aria-pressed={triggers.includes(s)} disabled={setTriggers.isPending || !uid} onClick={() => toggleTrigger(s)}>{s}</Button>)}</div>
    {triggers.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{triggers.map((t) => <Button key={t} size="sm" variant="destructive" disabled={add.isPending} onClick={() => add.mutate({ source: t, minutes: 15, breach: true })}>Men chalg‘idim: {t}</Button>)}</div>}
    {pending.map((p) => <div key={p.id} className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3" role="alert">
      <p className="text-sm font-semibold">Tiklanish intizomi · {p.source}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">−{BREACH_XP} XP. Bittasini bajaring — XP qaytadi.</p>
      <div className="mt-2 flex flex-wrap gap-2">{RECOVERY_TASKS.map((t) => <Button key={t} size="sm" variant="outline" disabled={recover.isPending} onClick={() => recover.mutate({ id: p.id, task: t })}>Bajardim: {t}</Button>)}</div>
    </div>)}
    <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold"><Smartphone className="size-4 text-primary" />Dopamin xaritasi</h3>
    <p className="mt-1 text-xs text-muted-foreground">Vaqtni nima o‘g‘irlayotganini qo‘lda yozing. Telefon vaqtini sayt avtomatik o‘lchay olmaydi.</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <select aria-label="Manba" value={source} onChange={(e) => setSource(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">{SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
      <Input aria-label="Daqiqa" type="number" min={1} max={1440} value={min} onChange={(e) => setMin(e.target.value)} className="h-9 w-24" />
      <Button size="sm" onClick={() => add.mutate({ source, minutes: Math.round(Number(min)), breach: false })} disabled={add.isPending || !uid}>Qo‘shish</Button>
    </div>
    <p className="mt-4 text-sm">7 kunda: <b>{Math.floor(total / 60)} soat {total % 60} daq</b></p>
    <div className="mt-2 space-y-2">{map.map((x) => <div key={x.source}><div className="flex justify-between text-xs"><span>{x.source}</span><span className="text-muted-foreground">{x.minutes} daq</span></div><div className="mt-1 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${(x.minutes / max) * 100}%` }} /></div></div>)}</div>
  </section>;
}
