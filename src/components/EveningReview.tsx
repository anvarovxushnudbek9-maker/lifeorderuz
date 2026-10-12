import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Moon, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { todayISO } from "@/lib/date";

export function EveningReview() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const today = todayISO();
  const qc = useQueryClient();
  const [mood, setMood] = React.useState(3);
  const [note, setNote] = React.useState("");
  const key = ["evening-review", uid, today];
  const { data, isPending, error } = useQuery({ queryKey: key, enabled: Boolean(uid), queryFn: async () => {
    const result = await supabase.from("journal_entries").select("id,content,mood").eq("user_id", uid).eq("entry_date", today).eq("title", "Kechki xulosa").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (result.error) throw result.error;
    return result.data;
  }});
  const save = useMutation({ mutationFn: async () => {
    if (!uid) throw new Error("Avval tizimga kiring.");
    const result = await supabase.from("journal_entries").insert({ user_id: uid, entry_date: today, title: "Kechki xulosa", mood, content: note.trim() || `Bugungi kayfiyat: ${mood}/5` });
    if (result.error) throw result.error;
  }, onSuccess: () => { void qc.invalidateQueries({ queryKey: key }); void qc.invalidateQueries({ queryKey: ["journal", uid] }); toast.success("Kechki xulosa saqlandi."); }, onError: (e: Error) => toast.error(e.message) });
  return <section className="mt-6 border-t border-border py-6" aria-label="Kechki xulosa">
    <h2 className="flex items-center gap-2 font-semibold"><Moon className="size-4 text-primary" />Kechki xulosa</h2>
    {error ? <p className="mt-3 text-sm text-destructive">Xulosani yuklab bo‘lmadi.</p> : data ? <div className="mt-3"><p className="flex items-center gap-2 text-sm text-primary"><Check className="size-4" />Bugungi xulosa saqlangan · {data.mood}/5</p><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{data.content}</p></div> : <form className="mt-3 max-w-xl space-y-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <fieldset><legend className="mb-2 text-sm text-muted-foreground">Bugun o‘zingizni qanday his qildingiz?</legend><div className="flex gap-2">{[1,2,3,4,5].map((value) => <Button key={value} type="button" variant={mood === value ? "default" : "outline"} aria-pressed={mood === value} onClick={() => setMood(value)}>{value}</Button>)}</div></fieldset>
      <Textarea aria-label="Bugun nima yordam berdi" placeholder="Nima yordam berdi? Ertaga nimani o‘zgartirasiz?" maxLength={5000} value={note} onChange={(e) => setNote(e.target.value)} />
      <Button disabled={save.isPending || isPending} type="submit">Xulosani saqlash</Button>
    </form>}
  </section>;
}