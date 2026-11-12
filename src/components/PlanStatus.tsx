import { Crown } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
export function PlanStatus() {
  const { plan, isPending, isError } = usePlan();
  return <section className="mb-5 border-y border-border py-4">
    <h2 className="flex items-center gap-2 font-semibold"><Crown className="size-4 text-primary" />{isPending ? "Tarif yuklanmoqda…" : isError ? "Tarifni tekshirib bo‘lmadi" : plan.kind === "trial" ? `Premium sinovi · ${plan.days} kun qoldi` : plan.kind === "premium" ? "Premium" : "Bepul"}</h2>
    {!isPending && !isError && <p className="mt-2 text-sm text-muted-foreground">AI: 24 soatda {plan.aiDaily} ta tahlil. Kunlik reja, odatlar, kitoblar va kundalik bepul qoladi. Sinov tugaganda avtomatik to‘lov yo‘q.</p>}
    <p className="mt-2 text-xs text-muted-foreground">Premium — 49 000 so‘m/oy. Sotib olish hali ochilmagan.</p>
  </section>;
}