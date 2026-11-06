import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Handshake } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function code() { return Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join(""); }

export function BuddyCard() {
  const { user } = useAuth(); const uid = user?.id ?? ""; const qc = useQueryClient();
  const [input, setInput] = React.useState("");
  const { data: link } = useQuery({ queryKey: ["buddy", uid], enabled: !!uid, queryFn: async () => (await supabase.from("buddy_links").select("invite_code,partner_id").eq("user_id", uid).maybeSingle()).data });
  const { data: partner } = useQuery({ queryKey: ["buddy_today", uid], enabled: !!link?.partner_id, queryFn: async () => (await supabase.rpc("buddy_today")).data?.[0] ?? null });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["buddy"] }); qc.invalidateQueries({ queryKey: ["buddy_today"] }); };
  const create = useMutation({ mutationFn: async () => { const { error } = await supabase.from("buddy_links").insert({ user_id: uid, invite_code: code() }); if (error) throw error; }, onSuccess: refresh, onError: (e: Error) => toast.error(e.message) });
  const accept = useMutation({ mutationFn: async () => { const { data, error } = await supabase.rpc("accept_buddy", { _code: input.trim().toUpperCase() }); if (error) throw error; if (!data) throw new Error("Kod topilmadi yoki band"); }, onSuccess: () => { toast.success("Hamkor ulandi"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const leave = useMutation({ mutationFn: async () => { const { error } = await supabase.from("buddy_links").delete().eq("user_id", uid); if (error) throw error; }, onSuccess: refresh });
  return <section className="rounded-2xl border border-border bg-card p-5">
    <h2 className="flex items-center gap-2 text-base font-semibold"><Handshake className="size-4 text-primary" />Mas’uliyat hamkori</h2>
    {link?.partner_id ? partner ? <div className="mt-3"><p className="text-sm"><b>{partner.partner_name}</b> bugun 3 ta asosiy ishdan <b>{partner.done}/{partner.total || 3}</b> tasini bajardi.</p><Button size="sm" variant="ghost" className="mt-2" onClick={() => leave.mutate()}>Hamkorlikni tugatish</Button></div>
      : <p className="mt-3 text-sm text-muted-foreground">Hamkor ulanishni tugatdi yoki kutilmoqda.</p>
    : <div className="mt-3 space-y-3">
      <p className="text-xs text-muted-foreground">Bitta do‘st bilan bir-biringizning kunlik 3 ta ishingiz natijasini ko‘ring. Faqat son ko‘rinadi, ish matni emas.</p>
      {link ? <p className="text-sm">Sizning kodingiz: <b className="tracking-widest">{link.invite_code}</b> — do‘stingizga yuboring.</p> : <Button size="sm" onClick={() => create.mutate()} disabled={!uid}>Taklif kodini olish</Button>}
      <div className="flex gap-2"><Input value={input} maxLength={40} placeholder="Do‘stingiz kodi" onChange={(e) => setInput(e.target.value)} /><Button size="sm" variant="outline" disabled={!input.trim() || accept.isPending} onClick={() => accept.mutate()}>Ulash</Button></div>
    </div>}
  </section>;
}
