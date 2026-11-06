import { createFileRoute } from "@tanstack/react-router";

import { parseStartCode } from "@/lib/telegram-reminders";
import { safeEqual, sendTelegram, telegramWebhookSecret } from "@/lib/telegram.server";

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const tgKey = process.env["TELEGRAM_API_KEY"];
        if (!tgKey) return new Response("Not configured", { status: 500 });
        const expected = await telegramWebhookSecret(tgKey);
        const actual = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(actual, expected)) return new Response("Unauthorized", { status: 401 });

        const update = (await request.json().catch(() => null)) as
          | { message?: { chat?: { id?: number; type?: string }; text?: string } }
          | null;
        const msg = update?.message;
        const chatId = msg?.chat?.id;
        if (typeof chatId !== "number" || msg?.chat?.type !== "private") return Response.json({ ok: true });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const text = (msg?.text ?? "").trim();

        if (/^\/stop\b/.test(text)) {
          await supabaseAdmin.from("telegram_links").delete().eq("chat_id", chatId);
          await sendTelegram(chatId, "Life Order eslatmalari o‘chirildi. Qayta ulash uchun ilovadagi “Telegramni ulash” tugmasini bosing.").catch(console.error);
          return Response.json({ ok: true });
        }

        const code = parseStartCode(text);
        if (!code) {
          await sendTelegram(chatId, "Bu bot Life Order eslatmalarini yuboradi. Ulash uchun ilovada Kundalik → “Telegramni ulash” tugmasini bosing.").catch(console.error);
          return Response.json({ ok: true });
        }

        const { data: link } = await supabaseAdmin
          .from("telegram_links")
          .select("user_id, code_expires_at")
          .eq("link_code", code)
          .maybeSingle();
        if (!link || !link.code_expires_at || new Date(link.code_expires_at) < new Date()) {
          await sendTelegram(chatId, "Havola eskirgan. Ilovadan yangi ulash havolasini oling.").catch(console.error);
          return Response.json({ ok: true });
        }

        // One chat belongs to one account.
        await supabaseAdmin.from("telegram_links").update({ chat_id: null }).eq("chat_id", chatId).neq("user_id", link.user_id);
        const { error } = await supabaseAdmin
          .from("telegram_links")
          .update({ chat_id: chatId, link_code: null, code_expires_at: null, linked_at: new Date().toISOString() })
          .eq("user_id", link.user_id);
        if (error) {
          console.error("telegram link", error.message);
          return Response.json({ ok: false }, { status: 500 });
        }
        await sendTelegram(chatId, "✅ Life Order ulandi. Kundalikdagi vaqtli eslatmalaringiz shu yerga keladi (kuniga ko‘pi bilan 5 ta). O‘chirish: /stop").catch(console.error);
        return Response.json({ ok: true });
      },
    },
  },
});
