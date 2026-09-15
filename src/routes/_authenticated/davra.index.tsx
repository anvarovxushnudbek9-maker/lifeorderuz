import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TITLE = "Davra — hamfikrlar jamoasi | Life Order";
const DESC = "Maqsadi bir xil odamlar bilan guruhlarda suhbatlashing va bir-biringizni qo'llab-quvvatlang.";

export const Route = createFileRoute("/_authenticated/davra/")({
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
  component: Circles,
});

function Circles() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const [name, setName] = React.useState("");

  const { data } = useQuery({
    queryKey: ["circles", uid],
    enabled: !!uid,
    queryFn: async () => {
      const [circles, mine] = await Promise.all([
        supabase.from("circles").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("circle_members").select("circle_id").eq("user_id", uid),
      ]);
      return {
        circles: circles.data ?? [],
        mine: new Set((mine.data ?? []).map((m) => m.circle_id)),
      };
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: c, error } = await supabase
        .from("circles")
        .insert({ name, created_by: uid })
        .select()
        .single();
      if (error) throw error;
      const { error: e2 } = await supabase
        .from("circle_members")
        .insert({ circle_id: c.id, user_id: uid, role: "owner" });
      if (e2) throw e2;
    },
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["circles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const join = useMutation({
    mutationFn: async (circleId: string) => {
      const { error } = await supabase
        .from("circle_members")
        .insert({ circle_id: circleId, user_id: uid });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Davraga qo'shildingiz");
      qc.invalidateQueries({ queryKey: ["circles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Davra" subtitle="Maqsadi bir xil odamlar bilan birga o'sing." />

      <form
        className="mb-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate();
        }}
      >
        <Input
          placeholder="Yangi davra nomi"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" className="shrink-0">
          Yaratish
        </Button>
      </form>

      {(data?.circles ?? []).length === 0 ? (
        <EmptyState text="Hali davra yo'q. Birinchi davrani siz yarating." />
      ) : (
        <div className="space-y-2">
          {(data?.circles ?? []).map((c) => {
            const isMember = data?.mine.has(c.id);
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    <span className="mr-2">{c.emoji}</span>
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.topic}</p>
                </div>
                {isMember ? (
                  <Link to="/davra/$id" params={{ id: c.id }}>
                    <Button size="sm" variant="outline">
                      Ochish
                    </Button>
                  </Link>
                ) : (
                  <Button size="sm" onClick={() => join.mutate(c.id)}>
                    Qo&apos;shilish
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
