import { createFileRoute } from "@tanstack/react-router";

import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { localClock, pickDue, reminderText } from "@/lib/telegram-reminders";
import { sendTelegram } from "@/lib/telegram.server";

export const Route = createFileRoute("/api/public/jobs/telegram-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: links, error } = await supabaseAdmin
          .from("telegram_links")
          .select("user_id, chat_id, timezone")
          .not("chat_id", "is", null)
          .limit(5000);
        if (error) return Response.json({ error: error.message }, { status: 500 });
        if (!links?.length) return Response.json({ sent: 0 });

        const now = new Date();
        const ids = links.map((l) => l.user_id);
        const { data: reminders } = await supabaseAdmin
          .from("reminders")
          .select("id, user_id, title, start_time, end_time, remind_date, repeat, done_on, note")
          .in("user_id", ids);

        let sent = 0;
        let failed = 0;
        for (const link of links) {
          const clock = localClock(now, link.timezone);
          const mine = (reminders ?? []).filter((r) => r.user_id === link.user_id);
          if (!mine.length) continue;
          const { data: deliveries } = await supabaseAdmin
            .from("reminder_deliveries")
            .select("reminder_id")
            .eq("user_id", link.user_id)
            .eq("local_date", clock.date)
            .eq("channel", "telegram");
          const already = new Set((deliveries ?? []).map((d) => d.reminder_id));
          for (const r of pickDue(mine, clock, already)) {
            // Claim first so overlapping runs never double-send.
            const claim = await supabaseAdmin
              .from("reminder_deliveries")
              .insert({ reminder_id: r.id, user_id: link.user_id, local_date: clock.date, channel: "telegram" });
            if (claim.error) continue;
            try {
              await sendTelegram(Number(link.chat_id), reminderText(r));
              sent++;
            } catch (e) {
              failed++;
              console.error((e as Error).message);
            }
          }
        }
        return Response.json({ sent, failed });
      },
    },
  },
});
