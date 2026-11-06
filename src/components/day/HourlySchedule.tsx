import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { todayISO } from "@/lib/date";

export function HourlySchedule() {
  const { user } = useAuth(); const uid = user?.id ?? ""; const today = todayISO();
  const qc = useQueryClient(); const key = ["schedule", uid, today];
  const [all, setAll] = React.useState(false);
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => setNow(new Date().getHours()), []);
  const { data = [] } = useQuery({ queryKey: key, enabled: !!uid, queryFn: async () => (await supabase.from("schedule_blocks").select("hour,title").eq("user_id", uid).eq("block_date", today)).data ?? [] });
  const save = useMutation({
    mutationFn: async ({ hour, title }: { hour: number; title: string }) => {
      const t = title.trim();
      const r = t ? await supabase.from("schedule_blocks").upsert({ user_id: uid, block_date: today, hour, title: t }, { onConflict: "user_id,block_date,hour" })
        : await supabase.from("schedule_blocks").delete().eq("user_id", uid).eq("block_date", today).eq("hour", hour);
      if (r.error) throw r.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }), onError: (e: Error) => toast.error(e.message),
  });
  const hours = Array.from({ length: 24 }, (_, i) => i).filter((h) => all || (h >= 6 && h <= 23));
  return <section className="rounded-2xl border border-border bg-card p-5">
    <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-semibold"><Clock className="size-4 text-primary" />Soatbay jadval</h2>
      <button type="button" className="text-xs text-primary" onClick={() => setAll(!all)}>{all ? "06–23" : "24 soat"}</button></div>
    <div className="mt-3 max-h-80 space-y-1 overflow-y-auto pr-1">{hours.map((h) => { const title = data.find((b) => b.hour === h)?.title ?? ""; return <div key={`${h}-${title}`} className={`flex items-center gap-3 rounded-lg px-2 py-1 ${now === h ? "bg-primary/10" : ""}`}>
      <span className="w-12 shrink-0 text-xs tabular-nums text-muted-foreground">{String(h).padStart(2, "0")}:00</span>
      <input defaultValue={title} maxLength={120} aria-label={`${h}:00 dagi ish`} placeholder="—" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50" onBlur={(e) => e.target.value.trim() !== title && save.mutate({ hour: h, title: e.target.value })} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
    </div>; })}</div>
  </section>;
}
