/** Free plan: AI requests per rolling 24 hours (confirmed product rule). */
export const FREE_AI_DAILY_LIMIT = 3;
export const AI_HOURLY_LIMIT = 30;

export function aiLimitReached(lastHour: number, lastDay: number, dailyLimit = FREE_AI_DAILY_LIMIT) {
  return lastHour >= AI_HOURLY_LIMIT || lastDay >= dailyLimit;
}
