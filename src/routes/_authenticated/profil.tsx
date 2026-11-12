import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { deleteMyAccount } from "@/lib/account.functions";
import { ArchetypeCard } from "@/components/day/ArchetypeCard";
import { PlanStatus } from "@/components/PlanStatus";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const TITLE = "Profil va sozlamalar — Life Order";
const DESC = "Ismingiz, maqsadingiz va ilova sozlamalarini boshqaring.";

export const Route = createFileRoute("/_authenticated/profil")({
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
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [form, setForm] = React.useState<{ full_name: string; bio: string; main_goal: string }>({
    full_name: "",
    bio: "",
    main_goal: "",
  });

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
      setForm({
        full_name: profile.full_name ?? "",
        bio: profile.bio ?? "",
        main_goal: profile.main_goal ?? "",
      });
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").upsert({ id: uid, ...form });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profil saqlandi");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useServerFn(deleteMyAccount);
  const remove = useMutation({
    mutationFn: () => del(),
    onSuccess: async () => {
      qc.clear();
      await supabase.auth.signOut();
      toast.success("Hisob va barcha ma'lumotlar o'chirildi");
      navigate({ to: "/", replace: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div>
      <PageHeader title="Profil" subtitle={user?.email ?? ""} />
      <PlanStatus />

      <form
        className="space-y-4 rounded-2xl border border-border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Ism</Label>
          <Input
            id="full_name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="main_goal">Asosiy maqsad</Label>
          <Input
            id="main_goal"
            placeholder="Masalan: har kuni 20 daqiqa o‘qish"
            value={form.main_goal}
            onChange={(e) => setForm({ ...form, main_goal: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">O&apos;zingiz haqingizda</Label>
          <Textarea
            id="bio"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>
        <Button type="submit" className="w-full" disabled={save.isPending}>
          Saqlash
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card p-5">
        <div>
          <p className="text-sm font-medium">Tungi rejim</p>
          <p className="text-xs text-muted-foreground">Ko&apos;zga qulay qorong&apos;i mavzu</p>
        </div>
        <Switch checked={theme === "dark"} onCheckedChange={toggle} />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-medium">Nadir murabbiy ohangi</p>
        <p className="text-xs text-muted-foreground">18 yoshgacha qat&apos;iy rejim yumshoq qoladi.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {([["normal", "Do‘stona"], ["hardcore", "Qat’iy"], ["sage", "Donishmand"]] as const).map(([v, l]) => (
            <Button key={v} size="sm" variant={(profile?.coach_mode ?? "normal") === v ? "default" : "outline"} onClick={async () => {
              const { error } = await supabase.from("profiles").update({ coach_mode: v }).eq("id", uid);
              if (error) toast.error(error.message); else { toast.success(`${l} ohangi tanlandi`); qc.invalidateQueries({ queryKey: ["profile"] }); }
            }}>{l}</Button>
          ))}
        </div>
      </div>

      <div className="mt-4"><ArchetypeCard /></div>

      <Button variant="outline" className="mt-4 w-full" onClick={signOut}>
        <LogOut className="mr-2 size-4" /> Hisobdan chiqish
      </Button>

      <Button
        variant="destructive"
        className="mt-3 w-full"
        disabled={remove.isPending}
        onClick={() => {
          if (window.prompt("Barcha ma'lumotlar butunlay o'chadi. Tasdiqlash uchun O'CHIRISH deb yozing") === "O'CHIRISH") remove.mutate();
        }}
      >
        <Trash2 className="mr-2 size-4" /> Hisobni o&apos;chirish
      </Button>

      <p className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
        <Link to="/maxfiylik">Maxfiylik siyosati</Link>
        <Link to="/shartlar">Foydalanish shartlari</Link>
      </p>
    </div>
  );
}
