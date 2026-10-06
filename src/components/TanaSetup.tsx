import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Ruler } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Progressive personalization: asks body numbers the first time the user opens Tana. */
export function TanaSetup() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const [age, setAge] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["profile-body", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("age,gender,height_cm,weight_kg")
        .eq("id", uid)
        .maybeSingle();
      return data;
    },
  });

  if (isLoading || !data) return null;
  if (data.age && data.gender && data.height_cm && data.weight_kg) return null;

  const a = Number(age), h = Number(height), w = Number(weight);
  const valid = a >= 10 && a <= 110 && h >= 80 && h <= 260 && w >= 20 && w <= 400 && !!gender;

  async function save() {
    if (!valid) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ age: a, gender, height_cm: h, weight_kg: w })
      .eq("id", uid);
    setSaving(false);
    if (error) {
      toast.error("Saqlab bo'lmadi. Qayta urinib ko'ring.");
      return;
    }
    toast.success("Rejangiz raqamlaringizga moslashtirildi");
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["profile-body", uid] }),
      qc.invalidateQueries({ queryKey: ["profile", uid] }),
    ]);
  }

  return (
    <section className="mb-5 rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Ruler className="size-5 text-primary" />
        </span>
        <div>
          <h2 className="font-semibold">Tana rejangizni aniqlashtiraylik</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            4 ta raqam — va kaloriya, oqsil, suv hamda mashq rejasi aynan sizga moslanadi.
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="ts-age">Yosh</Label>
          <Input id="ts-age" type="number" inputMode="numeric" placeholder="24" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ts-h">Bo&apos;y (sm)</Label>
          <Input id="ts-h" type="number" inputMode="numeric" placeholder="175" value={height} onChange={(e) => setHeight(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ts-w">Vazn (kg)</Label>
          <Input id="ts-w" type="number" inputMode="decimal" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Jins</Label>
          <div className="flex gap-1.5">
            {[
              { v: "male", t: "Erkak" },
              { v: "female", t: "Ayol" },
            ].map((g) => (
              <button
                key={g.v}
                type="button"
                onClick={() => setGender(g.v)}
                className={cn(
                  "h-9 flex-1 rounded-md border text-sm transition-colors",
                  gender === g.v ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent",
                )}
              >
                {g.t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Button className="mt-4 w-full sm:w-auto" onClick={save} disabled={!valid || saving}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : "Rejani moslashtirish"}
      </Button>
    </section>
  );
}
