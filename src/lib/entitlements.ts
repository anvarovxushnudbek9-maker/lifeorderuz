export const TRIAL_DAYS = 7;
export const PREMIUM_MONTHLY_UZS = 49000;
export const PREMIUM_AI_DAILY_LIMIT = 30;
export type Entitlement = { trial_ends_at: string; premium_until: string | null };
export function planStatus(value: Entitlement | null | undefined, now = Date.now()) {
  if (value?.premium_until && Date.parse(value.premium_until) > now) return { kind: "premium" as const, days: 0, aiDaily: PREMIUM_AI_DAILY_LIMIT };
  const remaining = value ? Date.parse(value.trial_ends_at) - now : 0;
  if (remaining > 0) return { kind: "trial" as const, days: Math.ceil(remaining / 86400000), aiDaily: PREMIUM_AI_DAILY_LIMIT };
  return { kind: "free" as const, days: 0, aiDaily: 3 };
}