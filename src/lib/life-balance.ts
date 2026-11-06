// Life Balance Radar: 0–100 score per life area from the last 7 days of real records.
export type BalanceInput = {
  bodyDays: number; // days with workout or body metric (0–7)
  learnDays: number; // days with reading/learning progress (0–7)
  habitLogs: number;
  habitsTotal: number;
  planDone: number;
  planTotal: number;
  circleMessages: number;
};
export type BalanceArea = { key: string; label: string; score: number };

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function lifeBalance(i: BalanceInput): BalanceArea[] {
  return [
    { key: "tana", label: "Tana", score: clamp((i.bodyDays / 5) * 100) },
    { key: "bilim", label: "Bilim", score: clamp((i.learnDays / 5) * 100) },
    { key: "odat", label: "Odat", score: i.habitsTotal ? clamp((i.habitLogs / (i.habitsTotal * 7)) * 100) : 0 },
    { key: "reja", label: "Boshqaruv", score: i.planTotal ? clamp((i.planDone / i.planTotal) * 100) : 0 },
    { key: "davra", label: "Davra", score: clamp((i.circleMessages / 5) * 100) },
  ];
}

export function weakest(areas: BalanceArea[]): BalanceArea | null {
  const sorted = [...areas].sort((a, b) => a.score - b.score);
  return sorted[0] && sorted[0].score < 40 ? sorted[0] : null;
}
