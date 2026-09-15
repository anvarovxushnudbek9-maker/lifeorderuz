import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/davra/$id")({
  head: () => ({
    meta: [
      { title: "Davra suhbati — Life Order" },
      { name: "description", content: "Davra a'zolari bilan jonli suhbat va qo'llab-quvvatlash." },
      { property: "og:title", content: "Davra suhbati — Life Order" },
      {
        property: "og:description",
        content: "Davra a'zolari bilan jonli suhbat va qo'llab-quvvatlash.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CircleChat,
});

function CircleChat() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const [text, setText] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);

  const { data: circle } = useQuery({
    queryKey: ["circle", id],
    queryFn: async () => {
      const { data } = await supabase.from("circles").select("*").eq("id", id).maybeSingle();
      return data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["circle-messages", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("circle_messages")
        .select("*")
        .eq("circle_id", id)
        .order("created_at")
        .limit(200);
      return data ?? [];
    },
  });

  React.useEffect(() => {
    const channel = supabase
      .channel(`circle-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "circle_messages", filter: `circle_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["circle-messages", id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, qc]);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("circle_messages")
        .insert({ circle_id: id, user_id: uid, content: text.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["circle-messages", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/davra">
          <Button variant="ghost" size="icon" aria-label="Orqaga">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold">{circle?.name ?? "Davra"}</h1>
          <p className="text-xs text-muted-foreground">{circle?.topic}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {(messages ?? []).length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Suhbatni birinchi bo&apos;lib boshlang.
          </p>
        ) : (
          (messages ?? []).map((m) => {
            const own = m.user_id === uid;
            return (
              <div key={m.id} className={cn("flex", own ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                    own
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-card-foreground",
                  )}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form
        className="sticky bottom-20 mt-4 flex gap-2 bg-background py-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) send.mutate();
        }}
      >
        <Input
          placeholder="Xabar yozing..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" size="icon" className="shrink-0" aria-label="Yuborish">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
