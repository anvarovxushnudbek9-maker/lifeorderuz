import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TITLE = "Bilim — kitoblar va kurslar | O'SISH";
const DESC = "Shaxsiy kutubxonangiz: o'qilayotgan kitoblar, kurslar va o'qish progressi.";

export const Route = createFileRoute("/_authenticated/bilim")({
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
  component: Knowledge,
});

function Knowledge() {
  return (
    <div>
      <PageHeader title="Bilim" subtitle="Kitoblar va kurslar kutubxonangiz." />
      <Tabs defaultValue="kitob">
        <TabsList className="mb-4 w-full">
          <TabsTrigger className="flex-1" value="kitob">
            Kitoblar
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="kurs">
            Kurslar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="kitob">
          <Books />
        </TabsContent>
        <TabsContent value="kurs">
          <Courses />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Books() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const [title, setTitle] = React.useState("");
  const [pages, setPages] = React.useState("");

  const { data } = useQuery({
    queryKey: ["books", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("books")
        .insert({ user_id: uid, title, total_pages: Number(pages || 0) });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setPages("");
      qc.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, current }: { id: string; current: number }) => {
      const { error } = await supabase.from("books").update({ current_page: current }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("books").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });

  return (
    <div>
      <form
        className="mb-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) add.mutate();
        }}
      >
        <Input placeholder="Kitob nomi" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          className="w-24 shrink-0"
          type="number"
          placeholder="sahifa"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
        />
        <Button type="submit" className="shrink-0">
          Qo&apos;shish
        </Button>
      </form>

      {(data ?? []).length === 0 ? (
        <EmptyState text="Kutubxona bo'sh. Birinchi kitobni qo'shing." />
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((b) => {
            const pct = b.total_pages ? Math.round((b.current_page / b.total_pages) * 100) : 0;
            return (
              <div key={b.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{b.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.current_page}/{b.total_pages} sahifa · {pct}%
                    </p>
                  </div>
                  <button
                    onClick={() => remove.mutate(b.id)}
                    aria-label="O'chirish"
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <Progress value={pct} className="mt-3" />
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update.mutate({ id: b.id, current: Math.max(0, b.current_page - 10) })
                    }
                  >
                    -10
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update.mutate({
                        id: b.id,
                        current: Math.min(b.total_pages || 9999, b.current_page + 10),
                      })
                    }
                  >
                    +10 sahifa
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Courses() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const [title, setTitle] = React.useState("");

  const { data } = useQuery({
    queryKey: ["courses", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("courses").insert({ user_id: uid, title });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      await supabase.from("courses").update({ progress }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("courses").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });

  return (
    <div>
      <form
        className="mb-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) add.mutate();
        }}
      >
        <Input placeholder="Kurs nomi" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button type="submit" className="shrink-0">
          Qo&apos;shish
        </Button>
      </form>

      {(data ?? []).length === 0 ? (
        <EmptyState text="Hali kurs qo'shilmagan." />
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.progress}% tugallandi</p>
                </div>
                <button
                  onClick={() => remove.mutate(c.id)}
                  aria-label="O'chirish"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <Progress value={c.progress} className="mt-3" />
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => update.mutate({ id: c.id, progress: Math.max(0, c.progress - 10) })}
                >
                  -10%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    update.mutate({ id: c.id, progress: Math.min(100, c.progress + 10) })
                  }
                >
                  +10%
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
