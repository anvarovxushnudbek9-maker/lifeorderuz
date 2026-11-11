export function activeHabitProgress(activeIds: string[], logs: { habit_id: string; log_date: string }[], date: string) {
  const active = new Set(activeIds);
  const done = new Set(logs.filter((log) => log.log_date === date && active.has(log.habit_id)).map((log) => log.habit_id));
  return { done, percent: active.size ? Math.round(done.size / active.size * 100) : 0 };
}