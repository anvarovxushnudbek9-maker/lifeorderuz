import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function CircleLeaderboard({ circleId }: { circleId: string }) {
  const { data = [] } = useQuery({ queryKey: ["circle_leaderboard", circleId], queryFn: async () => (await supabase.rpc("circle_leaderboard", { _circle: circleId })).data ?? [] });
  if (!data.length) return null;
  return <section className="mb-4 rounded-xl border border-border bg-card p-4">
    <h2 className="flex items-center gap-2 text-sm font-semibold"><Trophy className="size-4 text-primary" />Haftalik reyting</h2>
    <p className="text-xs text-muted-foreground">Odat belgisi 1 ball, bajarilgan asosiy ish 2 ball (7 kun).</p>
    <ol className="mt-2 space-y-1">{data.map((r, i) => <li key={i} className={`flex justify-between rounded-md px-2 py-1 text-sm ${r.is_me ? "bg-primary/10 font-semibold" : ""}`}><span>{i + 1}. {r.display_name}{r.is_me ? " (siz)" : ""}</span><span>{r.points}</span></li>)}</ol>
  </section>;
}
