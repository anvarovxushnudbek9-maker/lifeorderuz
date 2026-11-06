import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen, Check, Play, Plus, Search, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LIBRARY, LIBRARY_CATEGORIES, youtubeId, type LibraryBook } from "@/lib/book-library";
import { cn } from "@/lib/utils";

const TITLE = "Bilim — kitoblar va kurslar | Life Order";
const DESC = "Mashhur kitoblarning g'oyasi, xulosasi va 3 saboqi, shaxsiy kitob ro'yxati va YouTube kurslar.";

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
      <PageHeader title="Bilim" subtitle="Kitob xulosalari, o‘qish ro‘yxatingiz va kurslar." />
      <Tabs defaultValue="kutubxona">
        <TabsList className="mb-4 w-full">
          <TabsTrigger className="flex-1" value="kutubxona">
            Kutubxona
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="kitob">
            Mening kitoblarim
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="kurs">
            Kurslar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="kutubxona">
          <Library />
        </TabsContent>
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
  const [url, setUrl] = React.useState("");
  const [playing, setPlaying] = React.useState<string | null>(null);

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
      const link = url.trim();
      if (link && !youtubeId(link)) throw new Error("Hozircha faqat YouTube havolasi qo'llanadi.");
      const { error } = await supabase
        .from("courses")
        .insert({ user_id: uid, title: title.trim().slice(0, 200), url: link || null, provider: link ? "youtube" : null });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setUrl("");
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
        className="mb-5 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) add.mutate();
        }}
      >
        <Input placeholder="Kurs nomi" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="YouTube havolasi (ixtiyoriy)" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} />
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
              {youtubeId(c.url) &&
                (playing === c.id ? (
                  <div className="mt-3 aspect-video overflow-hidden rounded-lg bg-muted">
                    <iframe
                      className="size-full"
                      src={`https://www.youtube-nocookie.com/embed/${youtubeId(c.url)}?autoplay=1&rel=0`}
                      title={c.title}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <Button size="sm" variant="secondary" className="mt-3" onClick={() => setPlaying(c.id)}>
                    <Play className="size-4" /> Ilovada ko'rish
                  </Button>
                ))}
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

function Library() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<(typeof LIBRARY_CATEGORIES)[number]>("Hammasi");
  const [open, setOpen] = React.useState<string | null>(null);

  const { data: mine } = useQuery({
    queryKey: ["books", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase.from("books").select("*").eq("user_id", uid).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const saved = new Set((mine ?? []).map((b) => b.title.toLowerCase()));

  const add = useMutation({
    mutationFn: async (b: LibraryBook) => {
      const { error } = await supabase.from("books").insert({ user_id: uid, title: b.title, author: b.author, total_pages: b.pages });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["books"] });
      toast.success("Ro'yxatingizga qo'shildi");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const term = q.trim().toLowerCase();
  const list = LIBRARY.filter(
    (b) => (cat === "Hammasi" || b.category === cat) && (!term || `${b.title} ${b.author}`.toLowerCase().includes(term)),
  );

  return (
    <div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Kitob yoki muallif" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {LIBRARY_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        {list.length} ta kitob · qisqa mazmunlar Life Order uchun o'z so'zlarimiz bilan yozilgan.
      </p>
      {list.length === 0 ? (
        <EmptyState text="Hech narsa topilmadi." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((b) => {
            const isOpen = open === b.id;
            const has = saved.has(b.title.toLowerCase());
            return (
              <article key={b.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold leading-snug">{b.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {b.author} · {b.category} · {b.pages} bet
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium">{b.idea}</p>
                {isOpen && (
                  <div className="mt-3 space-y-3 text-sm">
                    <p className="leading-relaxed text-muted-foreground">{b.summary}</p>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">3 ta saboq</p>
                      <ol className="list-decimal space-y-1 pl-5">
                        {b.lessons.map((l) => (
                          <li key={l}>{l}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOpen(isOpen ? null : b.id)} aria-expanded={isOpen}>
                    {isOpen ? "Yopish" : "Xulosa va saboqlar"}
                  </Button>
                  <Button size="sm" variant={has ? "secondary" : "default"} disabled={has || add.isPending || !uid} onClick={() => add.mutate(b)}>
                    {has ? <Check className="size-4" /> : <Plus className="size-4" />}
                    {has ? "Ro'yxatda" : "O'qiyman"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
