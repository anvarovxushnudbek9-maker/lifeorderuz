import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const USER_TABLES = [
  "ai_messages", "ai_requests", "body_metrics", "books", "circle_members", "circle_messages",
  "courses", "daily_plan_items", "habit_logs", "habits", "journal_entries", "meals",
  "reminder_deliveries", "reminders", "telegram_links", "workouts",
  "top_tasks", "schedule_blocks", "distraction_logs", "buddy_links",
] as const;

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin as any;
    for (const t of USER_TABLES) {
      const { error } = await admin.from(t).delete().eq("user_id", userId);
      if (error && !/column .*user_id/i.test(error.message)) throw new Error(`${t}: ${error.message}`);
    }
    await admin.from("circles").delete().eq("created_by", userId);
    await admin.from("profiles").delete().eq("id", userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
