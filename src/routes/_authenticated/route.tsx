import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session, user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isPending: profilePending } = useQuery({
    queryKey: ["profile", user?.id ?? ""],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!profilePending && session && !profile?.onboarding_completed) navigate({ to: "/onboarding", replace: true });
  }, [profile, profilePending, session, navigate]);

  // Wait for the profile so pages never act (e.g. generate a plan) before onboarding is done.
  if (loading || !session || profilePending || !profile?.onboarding_completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
