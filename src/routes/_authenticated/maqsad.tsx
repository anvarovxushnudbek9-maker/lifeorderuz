import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TITLE = "Maqsadlar — O'SISH";
const DESC = "Asosiy maqsadingizni belgilang va e'tibor qaratadigan yo'nalishlarni tanlang.";

const AREAS = ["Tana", "Bilim", "Odatlar", "Davra", "Ruhiyat", "Moliya", "Karyera"];

export const Route = createFileRoute("/_authenticated/maqsad")({
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
  component: Goals,
});

function Goals() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const [goal, setGoal] = React.useState("");
  const [areas, setAreas] = React.useState<string[]>([]);

  const { data: profile } = useQuery({
    queryKey: ["profile", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      return data;
    },
  });

  React.useEffect(() => {
    if (profile) {
      setGoal(profile.main_goal ?? "");
      setAreas(profile.focus_areas ?? []);
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: uid, main_goal: goal, focus_areas: areas });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Maqsadlar saqlandi");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Maqsadlar" subtitle="Yo'nalish aniq bo'lsa, harakat oson bo'ladi." />

      <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <Label htmlFor="goal">Asosiy maqsad</Label>
          <Input
            id="goal"
            placeholder="Masalan: yil oxirigacha 24 ta kitob o'qish"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        <div>
          <Label>E&apos;tibor yo&apos;nalishlari</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {AREAS.map((a) => {
              const on = areas.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAreas(on ? areas.filter((x) => x !== a) : [...areas, a])}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-accent",
                  )}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        <Button className="w-full" onClick={() => save.mutate()} disabled={save.isPending}>
          Saqlash
        </Button>
      </div>
    </div>
  );
}
