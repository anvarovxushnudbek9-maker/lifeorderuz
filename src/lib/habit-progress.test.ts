import { expect, test } from "bun:test";
import { activeHabitProgress } from "./habit-progress";
test("archived habit logs do not inflate active habit completion", () => {
  const result = activeHabitProgress(["active-1", "active-2"], [
    { habit_id: "active-1", log_date: "2026-11-09" },
    { habit_id: "archived", log_date: "2026-11-09" },
    { habit_id: "active-2", log_date: "2026-11-08" },
  ], "2026-11-09");
  expect(result.percent).toBe(50);
  expect([...result.done]).toEqual(["active-1"]);
});
test("duplicate logs count once and no active habits means zero", () => {
  const log = { habit_id: "a", log_date: "2026-11-09" };
  expect(activeHabitProgress(["a"], [log, log], log.log_date).percent).toBe(100);
  expect(activeHabitProgress([], [log], log.log_date).percent).toBe(0);
});