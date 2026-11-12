import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
const TITLE = "Davra — umumiy suhbat | Life Order";
const DESC = "Life Order a’zolari uchun yagona umumiy suhbat va o‘zaro qo‘llab-quvvatlash.";
export const Route = createFileRoute("/_authenticated/davra/")({ head: () => ({ meta: [
  { title: TITLE }, { name: "description", content: DESC }, { property: "og:title", content: TITLE }, { property: "og:description", content: DESC }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: Community });
function Community() {
  const { user } = useAuth(); const qc = useQueryClient(); const [text, setText] = React.useState("");
  const query = useQuery({ queryKey: ["community-messages"], enabled: !!user, refetchInterval: 5000, refetchIntervalInBackground: false,
    queryFn: async () => { const { data, error } = await supabase.from("community_messages").select("id,user_id,content,created_at").order("created_at", { ascending: false }).limit(100); if (error) throw error; return (data ?? []).reverse(); },
  });
  const send = useMutation({ mutationFn: async () => {
    if (!user || !text.trim()) return;
    const { error } = await supabase.from("community_messages").insert({ user_id: user.id, content: text.trim() }); if (error) throw error;
  }, onSuccess: () => { setText(""); void qc.invalidateQueries({ queryKey: ["community-messages"] }); }, onError: (e: Error) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("community_messages").delete().eq("id", id).eq("user_id", user.id); if (error) throw error;
  }, onSuccess: () => void qc.invalidateQueries({ queryKey: ["community-messages"] }), onError: (e: Error) => toast.error(e.message) });
  return <div className="mx-auto max-w-3xl">
    <PageHeader title="Davra" subtitle="Birga o‘samiz" />
    <p className="mb-4 text-xs text-muted-foreground">Xabarlaringiz barcha a’zolarga ko‘rinadi. Shaxsiy ma’lumot yubormang. Hurmat bilan suhbatlashing.</p>
    <div className="flex max-h-[55vh] min-h-64 flex-col gap-3 overflow-y-auto py-3" role="log" aria-label="Umumiy suhbat" aria-live="polite">
      {query.isPending ? <p className="text-muted-foreground">Yuklanmoqda…</p> : query.isError ? <div><p>Xabarlar yuklanmadi.</p><Button onClick={() => void query.refetch()} variant="outline">Qayta urinish</Button></div> : !query.data?.length ? <p className="text-sm text-muted-foreground">Bugungi kichik g‘alabangiz qanday?</p> : query.data.map(m => <div key={m.id} className={cn("flex items-end gap-2", m.user_id === user?.id ? "justify-end" : "justify-start")}>
        <div className={cn("max-w-[85%] rounded-lg px-4 py-3", m.user_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}><p className="mb-1 text-xs opacity-70">{m.user_id === user?.id ? "Siz" : `A’zo ${m.user_id.slice(0, 4)}`} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p><p className="whitespace-pre-wrap break-words text-sm">{m.content}</p></div>
        {m.user_id === user?.id && <Button size="icon" variant="ghost" aria-label="Xabarni o‘chirish" disabled={remove.isPending} onClick={() => remove.mutate(m.id)}><Trash2 className="size-4" /></Button>}
      </div>)}
    </div>
    <form className="mt-4 flex items-end gap-2 border-t border-border pt-4" onSubmit={e => { e.preventDefault(); if (!send.isPending) send.mutate(); }}>
      <Textarea aria-label="Xabar" maxLength={2000} rows={2} value={text} onChange={e => setText(e.target.value)} placeholder="Bugungi kichik g‘alabam…" />
      <Button type="submit" size="icon" aria-label="Yuborish" disabled={!text.trim() || send.isPending}><Send className="size-4" /></Button>
    </form>
  </div>;
}