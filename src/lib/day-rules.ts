/** Daily water goal: ~33 ml per kg, clamped to a sane 1.5–4 L range; 2 L when weight is unknown. */
export function waterGoalMl(weightKg?: number | null) {
  if (!weightKg || weightKg <= 0) return 2000;
  return Math.round(Math.min(4000, Math.max(1500, weightKg * 33)) / 250) * 250;
}

/** Totals minutes per distraction source, largest first. */
export function distractionMap(logs: { source: string; minutes: number }[]) {
  const m = new Map<string, number>();
  for (const l of logs) m.set(l.source, (m.get(l.source) ?? 0) + l.minutes);
  return [...m.entries()].map(([source, minutes]) => ({ source, minutes })).sort((a, b) => b.minutes - a.minutes);
}
