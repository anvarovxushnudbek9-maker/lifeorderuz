import { breachPenalty } from "./life-os";
/** Deterministic XP: habit check 10, top-3 task 20, workout 15, journal 10, book added 5; minus 10 per unrecovered distraction breach. */
export function totalXp(c: { logs: number; tasks: number; workouts: number; journal: number; books: number; breaches?: number }) {
  return Math.max(0, c.logs * 10 + c.tasks * 20 + c.workouts * 15 + c.journal * 10 + c.books * 5 - breachPenalty(c.breaches ?? 0));
}
/** Level n needs 100·n·(n−1)/2 XP: L2 at 100, L3 at 300, L4 at 600… */
export function levelFor(xp: number) {
  let level = 1;
  while (100 * (level * (level + 1)) / 2 <= xp) level++;
  const base = (100 * level * (level - 1)) / 2;
  return { level, into: xp - base, need: 100 * level };
}
export const LEVEL_TITLES = ["Boshlovchi", "Izlanuvchi", "Intizomli", "Barqaror", "Kuchli", "Ustoz", "Afsona"];
export const levelTitle = (l: number) => LEVEL_TITLES[Math.min(l, LEVEL_TITLES.length) - 1]!;

/**
 * Streak with a weekly freeze: one missed day in any 7-day window is forgiven.
 * `days` is ascending; today may be unmarked without breaking the streak.
 */
export function streakWithFreeze(done: (day: string) => boolean, days: string[]) {
  let streak = 0; let lastFreeze = Infinity; let frozen = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (done(days[i]!)) { streak++; continue; }
    if (i === days.length - 1) continue;
    if (lastFreeze - i >= 7) { lastFreeze = i; frozen++; continue; }
    break;
  }
  return { streak, frozen };
}
