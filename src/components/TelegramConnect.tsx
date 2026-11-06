import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { TELEGRAM_BOT_USERNAME } from "@/lib/telegram-config";

function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return Array.from(bytes, (b) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"[b % 64]).join("");
}

export function TelegramConnect() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const key = ["telegram_link", uid];

  const { data: link } = useQuery({
    queryKey: key,
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase.from("telegram_links").select("chat_id, linked_at").eq("user_id", uid).maybeSingle();
      return data;
    },
    refetchInterval: (q) => (q.state.data?.chat_id ? false : 5000),
  });

  const connect = useMutation({
    mutationFn: async () => {
      const code = newCode();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tashkent";
      const code_expires_at = new Date(Date.now() + 15 * 60_000).toISOString();
      const { error } = await supabase
        .from("telegram_links")
        .upsert({ user_id: uid, link_code: code, code_expires_at, timezone }, { onConflict: "user_id" });
      if (error) throw error;
      return code;
    },
    onSuccess: (code) => {
      window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}?start=${code}`, "_blank", "noopener");
      qc.invalidateQueries({ queryKey: key });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const disconnect = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("telegram_links").delete().eq("user_id", uid);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success("Telegram uzildi");
    },
  });

  const linked = !!link?.chat_id;

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Send className="mt-0.5 size-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium">Telegram eslatmalar</p>
          <p className="text-xs text-muted-foreground">
            {!TELEGRAM_BOT_USERNAME
              ? "Tez orada: Life Order boti ulangach, eslatmalar sayt yopiq bo‘lsa ham Telegramga keladi."
              : linked
                ? "Ulangan. Eslatmalar vaqtida Telegramga keladi (kuniga ko‘pi bilan 5 ta)."
                : "Ulang — eslatmalar sayt yopiq bo‘lsa ham Telegramga keladi (kuniga ko‘pi bilan 5 ta)."}
          </p>
        </div>
      </div>
      {TELEGRAM_BOT_USERNAME &&
        (linked ? (
          <Button size="sm" variant="outline" onClick={() => disconnect.mutate()} disabled={disconnect.isPending}>
            Uzish
          </Button>
        ) : (
          <Button size="sm" onClick={() => connect.mutate()} disabled={connect.isPending || !uid}>
            Telegramni ulash
          </Button>
        ))}
    </div>
  );
}
