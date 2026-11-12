import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { planStatus } from "@/lib/entitlements";
export function usePlan() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["plan-entitlement", user?.id], enabled: !!user, staleTime: 60000,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("plan_entitlements").select("trial_ends_at,premium_until").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  return { ...query, plan: planStatus(query.data) };
}