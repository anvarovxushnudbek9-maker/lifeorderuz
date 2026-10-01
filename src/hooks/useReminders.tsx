import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { localISO, type Reminder } from "@/lib/reminders";

export function useReminders() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const key = ["reminders", uid];

  const query = useQuery({
    queryKey: key,
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", uid)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleDone = useMutation({
    mutationFn: async (r: Reminder) => {
      const today = localISO();
      const list = r.done_on ?? [];
      const done_on = list.includes(today) ? list.filter((d) => d !== today) : [...list, today];
      const { error } = await supabase.from("reminders").update({ done_on }).eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: (e) => toast.error((e as Error).message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { ...query, reminders: query.data ?? [], toggleDone, remove, uid, key };
}
