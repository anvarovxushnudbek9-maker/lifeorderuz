import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { todayISO } from "@/lib/date";

const TITLE = "A4 kunlik planner — Life Order";
const DESC = "Bugungi 3 ta asosiy ish va soatbay jadvalni A4 varaqda chop eting yoki PDF saqlang.";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({ meta: [{ title: TITLE }, { name: "description", content: DESC }, { property: "og:title", content: TITLE }, { property: "og:description", content: DESC }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Planner,
});

function Planner() {
  const { user } = useAuth(); const uid = user?.id ?? ""; const today = todayISO();
  const { data } = useQuery({ queryKey: ["planner", uid, today], enabled: !!uid, queryFn: async () => {
    const [t, s] = await Promise.all([supabase.from("top_tasks").select("position,title,done").eq("user_id", uid).eq("task_date", today).order("position"), supabase.from("schedule_blocks").select("hour,title").eq("user_id", uid).eq("block_date", today)]);
    return { tasks: t.data ?? [], blocks: s.data ?? [] };
  } });
  return <div>
    <style>{`@media print { @page { size: A4; margin: 14mm } nav, header, .no-print, [data-app-chrome] { display: none !important } body { background: white } .print-sheet { border: 0 !important; box-shadow: none !important } }`}</style>
    <div className="no-print mb-4 flex gap-2"><Button onClick={() => window.print()}>Chop etish / PDF saqlash</Button><Button variant="outline" asChild><Link to="/dashboard">Orqaga</Link></Button></div>
    <div className="print-sheet mx-auto max-w-[210mm] rounded-xl border border-border bg-card p-8 text-sm">
      <div className="flex items-end justify-between border-b border-border pb-3"><h1 className="text-xl font-bold">Life Order — kunlik reja</h1><span>{today}</span></div>
      <h2 className="mt-5 font-semibold">3 ta asosiy ish</h2>
      <ol className="mt-2 space-y-2">{[1, 2, 3].map((n) => { const t = data?.tasks.find((x) => x.position === n); return <li key={n} className="flex gap-3 border-b border-dashed border-border pb-2"><span className="inline-block size-4 rounded border border-foreground" />{t?.title ?? ""}</li>; })}</ol>
      <h2 className="mt-5 font-semibold">Soatbay jadval</h2>
      <div className="mt-2">{Array.from({ length: 18 }, (_, i) => i + 6).map((h) => <div key={h} className="flex gap-3 border-b border-border py-1.5"><span className="w-12 tabular-nums text-muted-foreground">{String(h).padStart(2, "0")}:00</span>{data?.blocks.find((b) => b.hour === h)?.title ?? ""}</div>)}</div>
      <div className="mt-5 grid grid-cols-2 gap-4"><div><h2 className="font-semibold">Suv (stakan)</h2><p className="mt-2 tracking-[0.4em]">○○○○○○○○</p></div><div><h2 className="font-semibold">Kechki xulosa</h2><div className="mt-2 h-16 border-b border-dashed border-border" /></div></div>
    </div>
  </div>;
}
