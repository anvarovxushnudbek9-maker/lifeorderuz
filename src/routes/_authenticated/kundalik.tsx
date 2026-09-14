import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TITLE = "Kundalik — O'SISH";
const DESC = "Kunlik fikrlaringizni yozing, kayfiyatni kuzating va o'z o'sishingizni ko'ring.";

export const Route = createFileRoute("/_authenticated/kundalik")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Journal,
});

function Journal() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  const { data } = useQuery({
    queryKey: ["journal", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("journal_entries")
        .insert({ user_id: uid, title: title || null, content });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setContent("");
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("journal_entries").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });

  return (
    <div>
      <PageHeader title="Kundalik" subtitle="Fikrlaringizni yozib boring." />

      <form
        className="mb-6 space-y-3 rounded-xl border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (content.trim()) add.mutate();
        }}
      >
        <Input placeholder="Sarlavha" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          rows={4}
          placeholder="Bugun nima bo'ldi, nimani o'rgandingiz?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={add.isPending}>
          Saqlash
        </Button>
      </form>

      {(data ?? []).length === 0 ? (
        <EmptyState text="Hali yozuv yo'q." />
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((e) => (
            <div key={e.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{e.title || "Yozuv"}</p>
                  <p className="text-xs text-muted-foreground">{e.entry_date}</p>
                </div>
                <button
                  onClick={() => remove.mutate(e.id)}
                  aria-label="O'chirish"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{e.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
