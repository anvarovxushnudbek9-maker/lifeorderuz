import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type QuickAddKind = "journal" | "habit" | "workout" | "meal";

const TITLES: Record<QuickAddKind, string> = {
  journal: "Kundalik yozuv",
  habit: "Yangi odat",
  workout: "Mashqni yozish",
  meal: "Ovqatni yozish",
};

export function QuickAddDialog({
  kind,
  onClose,
}: {
  kind: QuickAddKind | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setForm({});
  }, [kind]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user || !kind) return;
      const uid = user.id;
      if (kind === "journal") {
        const { error } = await supabase.from("journal_entries").insert({
          user_id: uid,
          title: form["title"] || null,
          content: form["content"] ?? "",
        });
        if (error) throw error;
      } else if (kind === "habit") {
        const { error } = await supabase.from("habits").insert({
          user_id: uid,
          title: form["title"] ?? "",
          emoji: form["emoji"] || "✅",
          target_per_week: Number(form["target"] || 7),
        });
        if (error) throw error;
      } else if (kind === "workout") {
        const { error } = await supabase.from("workouts").insert({
          user_id: uid,
          title: form["title"] ?? "",
          kind: form["kind"] || "kuch",
          duration_min: Number(form["duration"] || 30),
          calories: form["calories"] ? Number(form["calories"]) : null,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("meals").insert({
          user_id: uid,
          title: form["title"] ?? "",
          meal_type: form["meal_type"] || "nonushta",
          kcal: Number(form["kcal"] || 0),
          protein_g: Number(form["protein"] || 0),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Saqlandi");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={kind !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{kind ? TITLES[kind] : ""}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          {kind === "journal" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="q-title">Sarlavha</Label>
                <Input id="q-title" value={form["title"] ?? ""} onChange={set("title")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="q-content">Bugun nima bo&apos;ldi?</Label>
                <Textarea
                  id="q-content"
                  rows={5}
                  required
                  value={form["content"] ?? ""}
                  onChange={set("content")}
                />
              </div>
            </>
          ) : null}

          {kind === "habit" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="q-title">Odat nomi</Label>
                <Input
                  id="q-title"
                  required
                  placeholder="Ertalabki yugurish"
                  value={form["title"] ?? ""}
                  onChange={set("title")}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="q-emoji">Belgi</Label>
                  <Input
                    id="q-emoji"
                    placeholder="🏃"
                    value={form["emoji"] ?? ""}
                    onChange={set("emoji")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-target">Haftasiga</Label>
                  <Input
                    id="q-target"
                    type="number"
                    min={1}
                    max={7}
                    placeholder="7"
                    value={form["target"] ?? ""}
                    onChange={set("target")}
                  />
                </div>
              </div>
            </>
          ) : null}

          {kind === "workout" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="q-title">Mashq nomi</Label>
                <Input
                  id="q-title"
                  required
                  placeholder="Ko'krak kuni"
                  value={form["title"] ?? ""}
                  onChange={set("title")}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="q-kind">Turi</Label>
                  <Input
                    id="q-kind"
                    placeholder="kuch"
                    value={form["kind"] ?? ""}
                    onChange={set("kind")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-duration">Daqiqa</Label>
                  <Input
                    id="q-duration"
                    type="number"
                    placeholder="45"
                    value={form["duration"] ?? ""}
                    onChange={set("duration")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-cal">Kaloriya</Label>
                  <Input
                    id="q-cal"
                    type="number"
                    placeholder="350"
                    value={form["calories"] ?? ""}
                    onChange={set("calories")}
                  />
                </div>
              </div>
            </>
          ) : null}

          {kind === "meal" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="q-title">Taom</Label>
                <Input
                  id="q-title"
                  required
                  placeholder="Tovuqli guruch"
                  value={form["title"] ?? ""}
                  onChange={set("title")}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="q-mt">Mahal</Label>
                  <Input
                    id="q-mt"
                    placeholder="tushlik"
                    value={form["meal_type"] ?? ""}
                    onChange={set("meal_type")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-kcal">Kkal</Label>
                  <Input
                    id="q-kcal"
                    type="number"
                    placeholder="600"
                    value={form["kcal"] ?? ""}
                    onChange={set("kcal")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-prot">Oqsil (g)</Label>
                  <Input
                    id="q-prot"
                    type="number"
                    placeholder="40"
                    value={form["protein"] ?? ""}
                    onChange={set("protein")}
                  />
                </div>
              </div>
            </>
          ) : null}

          <Button type="submit" className="w-full" disabled={save.isPending}>
            {save.isPending ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
