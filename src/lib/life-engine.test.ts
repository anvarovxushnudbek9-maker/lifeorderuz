import { describe, expect, test } from "bun:test";
import { decide, type EngineInput } from "./life-engine";
import { buildNutrition } from "./plan";

const base: EngineInput = { profile: {}, history: [], habitsTotal: 0, habitsDoneToday: 0, sleepHours: null, todayISO: "2026-10-13" };
describe("daily planning safety", () => {
  test("returns one to three finite positive actions", () => {
    const plan = decide(base);
    expect(plan.actions.length).toBeGreaterThan(0);
    expect(plan.actions.length).toBeLessThanOrEqual(3);
    expect(plan.actions.every((action) => Number.isFinite(action.minutes) && action.minutes > 0)).toBe(true);
  });
  test("small time budgets are respected", () => {
    const plan = decide({ ...base, profile: { main_goal: "Learning", digital_habits: { free_time: "30 daqiqadan kam" } } });
    expect(plan.actions.reduce((sum, action) => sum + action.minutes, 0)).toBeLessThanOrEqual(25);
  });
  test("no invented success when history is absent", () => {
    expect(decide(base).diagnosis.label).toBe("Birinchi qadam");
  });
  test("completed carry-over is not repeated", () => {
    const plan = decide({ ...base, history: [
      { plan_date: "2026-10-11", title: "Read", status: "postponed", minutes: 10, domain: "bilim", skip_reason: null },
      { plan_date: "2026-10-12", title: "Read", status: "done", minutes: 10, domain: "bilim", skip_reason: null },
    ] });
    expect(plan.actions.some((action) => action.source === "carry")).toBe(false);
  });
  test("adult energy formula is not applied to minors", () => {
    expect(buildNutrition({ age: 16, height_cm: 165, weight_kg: 60, goal_type: "lose" })).toBeNull();
  });
});