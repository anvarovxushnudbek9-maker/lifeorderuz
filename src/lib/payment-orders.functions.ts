import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PREMIUM_MONTHLY_UZS } from "./entitlements";
/** Provider checkout must be configured before this function can create an order. */
export const createPaymentOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { provider: "click" | "payme" }) => {
    if (input.provider !== "click" && input.provider !== "payme") throw new Error("Noto‘g‘ri to‘lov xizmati");
    return input;
  })
  .handler(async ({ context, data }) => {
    const configured = data.provider === "click" ? process.env["CLICK_MERCHANT_ID"] : process.env["PAYME_MERCHANT_ID"];
    if (!configured) throw new Error("To‘lovlar hali ochilmagan. Sizdan pul olinmaydi.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin.from("payment_orders").insert({ user_id: context.userId, provider: data.provider, amount_uzs: PREMIUM_MONTHLY_UZS }).select("id,status,amount_uzs").single();
    if (error) throw error;
    return order;
  });