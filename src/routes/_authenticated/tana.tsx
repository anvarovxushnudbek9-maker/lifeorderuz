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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { todayISO, lastNDays } from "@/lib/date";

const TITLE = "Tana — mashq, ovqat va tiklanish | O'SISH";
const DESC =
  "Mashqlaringiz, ovqatlanishingiz, uyqu, suv va vazningizni kuzating hamda progressni ko'ring.";

export const Route = createFileRoute("/_authenticated/tana")({
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
  component: Body,
});

function Body() {
  return (
    <div>
      <PageHeader title="Tana" subtitle="Mashq, ovqatlanish va tiklanish." />
      <Tabs defaultValue="mashq">
        <TabsList className="mb-4 w-full">
          <TabsTrigger className="flex-1" value="mashq">
            Mashq
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="ovqat">
            Ovqat
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="tiklanish">
            Tiklanish
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mashq">
          <Workouts />
        </TabsContent>
        <TabsContent value="ovqat">
          <Meals />
        </TabsContent>
        <TabsContent value="tiklanish">
          <Recovery />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Workouts() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const [title, setTitle] = React.useState("");
  const [duration, setDuration] = React.useState("");

  const { data } = useQuery({
    queryKey: ["workouts", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", uid)
        .order("performed_on", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("workouts").insert({
        user_id: uid,
        title,
        duration_min: Number(duration || 30),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setDuration("");
      qc.invalidateQueries({ queryKey: ["workouts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("workouts").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
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
        <Input placeholder="Mashq nomi" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          className="w-24 shrink-0"
          type="number"
          placeholder="daq"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <Button type="submit" className="shrink-0">
          Qo&apos;shish
        </Button>
      </form>
      {(data ?? []).length === 0 ? (
        <EmptyState text="Hali mashq yozilmagan." />
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((w) => (
            <Row
              key={w.id}
              title={w.title}
              meta={`${w.performed_on} · ${w.duration_min} daqiqa${w.calories ? ` · ${w.calories} kkal` : ""}`}
              onDelete={() => remove.mutate(w.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Meals() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const [title, setTitle] = React.useState("");
  const [kcal, setKcal] = React.useState("");

  const { data } = useQuery({
    queryKey: ["meals", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", uid)
        .order("eaten_on", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("meals")
        .insert({ user_id: uid, title, kcal: Number(kcal || 0) });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setKcal("");
      qc.invalidateQueries({ queryKey: ["meals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("meals").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meals"] }),
  });

  const today = todayISO();
  const todayKcal = (data ?? []).filter((m) => m.eaten_on === today).reduce((s, m) => s + m.kcal, 0);

  return (
    <div>
      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">Bugungi kaloriya</p>
        <p className="mt-1 text-2xl font-bold">{todayKcal} kkal</p>
      </div>
      <form
        className="mb-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) add.mutate();
        }}
      >
        <Input placeholder="Taom" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          className="w-24 shrink-0"
          type="number"
          placeholder="kkal"
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
        />
        <Button type="submit" className="shrink-0">
          Qo&apos;shish
        </Button>
      </form>
      {(data ?? []).length === 0 ? (
        <EmptyState text="Hali ovqat yozilmagan." />
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((m) => (
            <Row
              key={m.id}
              title={m.title}
              meta={`${m.eaten_on} · ${m.kcal} kkal · ${m.protein_g} g oqsil`}
              onDelete={() => remove.mutate(m.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Recovery() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const today = todayISO();
  const days = lastNDays(7);
  const [form, setForm] = React.useState<Record<string, string>>({});

  const { data } = useQuery({
    queryKey: ["metrics", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("body_metrics")
        .select("*")
        .eq("user_id", uid)
        .gte("metric_date", days[0]!)
        .order("metric_date", { ascending: false });
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("body_metrics").upsert(
        {
          user_id: uid,
          metric_date: today,
          weight_kg: form["weight"] ? Number(form["weight"]) : null,
          sleep_hours: form["sleep"] ? Number(form["sleep"]) : null,
          water_ml: Number(form["water"] || 0),
          steps: Number(form["steps"] || 0),
        },
        { onConflict: "user_id,metric_date" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saqlandi");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <form
        className="rounded-xl border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <p className="mb-3 text-sm font-semibold">Bugungi ko&apos;rsatkichlar</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="weight">Vazn (kg)</Label>
            <Input id="weight" type="number" step="0.1" onChange={set("weight")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sleep">Uyqu (soat)</Label>
            <Input id="sleep" type="number" step="0.5" onChange={set("sleep")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="water">Suv (ml)</Label>
            <Input id="water" type="number" onChange={set("water")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="steps">Qadam</Label>
            <Input id="steps" type="number" onChange={set("steps")} />
          </div>
        </div>
        <Button type="submit" className="mt-4 w-full" disabled={save.isPending}>
          Saqlash
        </Button>
      </form>

      <h2 className="mb-2 mt-6 text-sm font-semibold">Oxirgi 7 kun</h2>
      {(data ?? []).length === 0 ? (
        <EmptyState text="Hali ko'rsatkich yo'q." />
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <span className="font-medium">{m.metric_date}</span>
              <span className="text-xs text-muted-foreground">
                {m.weight_kg ? `${m.weight_kg} kg · ` : ""}
                {m.sleep_hours ? `${m.sleep_hours} s · ` : ""}
                {m.water_ml} ml · {m.steps} qadam
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({
  title,
  meta,
  onDelete,
}: {
  title: string;
  meta: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      <button
        onClick={onDelete}
        aria-label="O'chirish"
        className="text-muted-foreground transition-colors hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
