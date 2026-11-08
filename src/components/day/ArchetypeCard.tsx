import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { todayISO } from "@/lib/date";
import { ARCHETYPES, blocksToApply, type ArchetypeId } from "@/lib/life-os";

export function ArchetypeCard() {
  const { user } = useAuth(); const uid = user?.id ?? ""; const today = todayISO(); const qc = useQueryClient();
  const key = ["archetype", uid];
  const { data: current = null } = useQuery({ queryKey: key, enabled: !!uid, queryFn: async () => {
    const r = await supabase.from("profiles").select("archetype").eq("id", uid).maybeSingle();
    if (r.error) throw r.error; return (r.data?.archetype ?? null) as ArchetypeId | null;
  } });
  const choose = useMutation({
    mutationFn: async (id: ArchetypeId) => {
      const { error } = await supabase.from("profiles").update({ archetype: id }).eq("id", uid);
      if (error) throw error;
      const filled = await supabase.from("schedule_blocks").select("hour").eq("user_id", uid).eq("block_date", today);
      if (filled.error) throw filled.error;
      const rows = blocksToApply(id, (filled.data ?? []).map((b) => b.hour)).map((b) => ({ user_id: uid, block_date: today, hour: b.hour, title: b.title }));
      if (rows.length) { const ins = await supabase.from("schedule_blocks").insert(rows); if (ins.error) throw ins.error; }
      return rows.length;
    },
    onSuccess: (n) => {
      void qc.invalidateQueries({ queryKey: key }); void qc.invalidateQueries({ queryKey: ["schedule", uid, today] }); void qc.invalidateQueries({ queryKey: ["life-engine", uid] });
      toast.success(n ? `Shablon qo‘llandi: jadvalga ${n} ta blok qo‘shildi` : "Shablon tanlandi. O‘zingiz yozgan soatlar o‘zgarmadi.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return <section className="rounded-2xl border border-border bg-card p-5" aria-label="Kun shabloni">
    <h2 className="flex items-center gap-2 text-base font-semibold"><LayoutTemplate className="size-4 text-primary" />Hayot arxetipi</h2>
    <p className="mt-1 text-xs text-muted-foreground">1 bosishda tayyor kun tartibi. Soatbay jadvalning bo‘sh soatlari to‘ldiriladi, yozganlaringiz o‘zgarmaydi.</p>
    <div className="mt-3 grid gap-2 sm:grid-cols-3">{ARCHETYPES.map((a) => <button key={a.id} type="button" disabled={choose.isPending || !uid} aria-pressed={current === a.id} onClick={() => choose.mutate(a.id)}
      className={cn("rounded-xl border p-3 text-left transition-colors hover:bg-accent disabled:opacity-60", current === a.id ? "border-primary bg-primary/5" : "border-border")}>
      <p className="text-sm font-semibold">{a.title}</p><p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
      {current === a.id && <p className="mt-2 text-xs font-medium text-primary">Tanlangan · qayta bosib bugunga qo‘llang</p>}
    </button>)}</div>
  </section>;
}
