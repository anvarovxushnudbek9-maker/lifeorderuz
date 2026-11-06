import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Smartphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lastNDays } from "@/lib/date";
import { distractionMap } from "@/lib/day-rules";

const SOURCES = ["Instagram", "TikTok", "YouTube", "Telegram", "O‘yinlar", "Boshqa"];

export function DopamineMap() {
  const { user } = useAuth(); const uid = user?.id ?? ""; const from = lastNDays(7)[0]!; const qc = useQueryClient();
  const key = ["distractions", uid, from];
  const [source, setSource] = React.useState(SOURCES[0]!); const [min, setMin] = React.useState("15");
  const { data = [] } = useQuery({ queryKey: key, enabled: !!uid, queryFn: async () => (await supabase.from("distraction_logs").select("source,minutes").eq("user_id", uid).gte("logged_on", from)).data ?? [] });
  const add = useMutation({
    mutationFn: async () => { const m = Math.round(Number(min)); if (!(m >= 1 && m <= 1440)) throw new Error("Daqiqani 1–1440 oralig‘ida kiriting"); const { error } = await supabase.from("distraction_logs").insert({ user_id: uid, source, minutes: m }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success("Yozildi — halollik birinchi qadam"); }, onError: (e: Error) => toast.error(e.message),
  });
  const map = distractionMap(data); const total = map.reduce((s, x) => s + x.minutes, 0); const max = map[0]?.minutes ?? 1;
  return <section className="rounded-2xl border border-border bg-card p-5">
    <h2 className="flex items-center gap-2 text-base font-semibold"><Smartphone className="size-4 text-primary" />Dopamin xaritasi</h2>
    <p className="mt-1 text-xs text-muted-foreground">Vaqtni nima o‘g‘irlayotganini qo‘lda yozing. Telefon vaqtini sayt avtomatik o‘lchay olmaydi.</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <select aria-label="Manba" value={source} onChange={(e) => setSource(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">{SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
      <Input aria-label="Daqiqa" type="number" min={1} max={1440} value={min} onChange={(e) => setMin(e.target.value)} className="h-9 w-24" />
      <Button size="sm" onClick={() => add.mutate()} disabled={add.isPending || !uid}>Qo‘shish</Button>
    </div>
    <p className="mt-4 text-sm">7 kunda: <b>{Math.floor(total / 60)} soat {total % 60} daq</b></p>
    <div className="mt-2 space-y-2">{map.map((x) => <div key={x.source}><div className="flex justify-between text-xs"><span>{x.source}</span><span className="text-muted-foreground">{x.minutes} daq</span></div><div className="mt-1 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${(x.minutes / max) * 100}%` }} /></div></div>)}</div>
  </section>;
}
