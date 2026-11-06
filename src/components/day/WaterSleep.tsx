import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Droplets, Moon, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { todayISO } from "@/lib/date";
import { waterGoalMl } from "@/lib/day-rules";

export function WaterSleep({ weightKg }: { weightKg?: number | null }) {
  const { user } = useAuth(); const uid = user?.id ?? ""; const today = todayISO(); const qc = useQueryClient();
  const key = ["metrics_today", uid, today];
  const { data } = useQuery({ queryKey: key, enabled: !!uid, queryFn: async () => (await supabase.from("body_metrics").select("id,water_ml,sleep_hours,sleep_quality").eq("user_id", uid).eq("metric_date", today).maybeSingle()).data });
  const save = useMutation({
    mutationFn: async (patch: { water_ml?: number; sleep_hours?: number | null; sleep_quality?: number | null }) => {
      const r = data?.id ? await supabase.from("body_metrics").update(patch).eq("id", data.id) : await supabase.from("body_metrics").insert({ user_id: uid, metric_date: today, ...patch });
      if (r.error) throw r.error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); qc.invalidateQueries({ queryKey: ["dashboard"] }); }, onError: (e: Error) => toast.error(e.message),
  });
  const water = data?.water_ml ?? 0; const goal = waterGoalMl(weightKg);
  const sleep = Number(data?.sleep_hours ?? 0);
  return <section className="grid gap-3 sm:grid-cols-2">
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold"><Droplets className="size-4 text-primary" />Suv</h2>
      <p className="mt-2 text-2xl font-bold">{water} <span className="text-sm font-normal text-muted-foreground">/ {goal} ml</span></p>
      <Progress value={Math.min(100, (water / goal) * 100)} className="mt-3" />
      <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" aria-label="250 ml kamaytirish" disabled={water <= 0} onClick={() => save.mutate({ water_ml: Math.max(0, water - 250) })}><Minus className="size-4" /></Button>
        <Button size="sm" className="flex-1" onClick={() => save.mutate({ water_ml: Math.min(8000, water + 250) })}><Plus className="size-4" />1 stakan (250 ml)</Button></div>
    </div>
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold"><Moon className="size-4 text-primary" />Uyqu</h2>
      <div className="mt-2 flex items-center gap-2"><Button size="icon" variant="outline" aria-label="Kamroq" onClick={() => save.mutate({ sleep_hours: Math.max(0, sleep - 0.5) })}><Minus className="size-4" /></Button>
        <span className="flex-1 text-center text-2xl font-bold">{sleep} <span className="text-sm font-normal text-muted-foreground">soat</span></span>
        <Button size="icon" variant="outline" aria-label="Ko‘proq" onClick={() => save.mutate({ sleep_hours: Math.min(16, sleep + 0.5) })}><Plus className="size-4" /></Button></div>
      <p className="mt-3 text-xs text-muted-foreground">Sifati:</p>
      <div className="mt-1 flex gap-1">{[1, 2, 3, 4, 5].map((q) => <button key={q} type="button" aria-label={`Uyqu sifati ${q}`} onClick={() => save.mutate({ sleep_quality: q })} className={`h-8 flex-1 rounded-md border text-sm ${data?.sleep_quality === q ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{q}</button>)}</div>
      {sleep > 0 && sleep < 7 && <p className="mt-2 text-xs text-muted-foreground">7–9 soat uyqu tavsiya etiladi.</p>}
    </div>
  </section>;
}
