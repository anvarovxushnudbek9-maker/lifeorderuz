import { describe, expect, test } from "bun:test";
import { applyEnergy, blocksToApply, breachPenalty, freeTopPosition, isShutdownTime } from "./life-os";
import { decide, type EngineInput } from "./life-engine";
import { totalXp } from "./gamification";

const three = [{ minutes: 30 }, { minutes: 25 }, { minutes: 10 }];
describe("energy engine", () => {
  test("low energy keeps only one item at half time", () => expect(applyEnergy(three, 1)).toEqual([{ minutes: 15 }]));
  test("high energy keeps all three", () => expect(applyEnergy(three, 3)).toHaveLength(3));
  test("half time never drops below 2 minutes", () => expect(applyEnergy([{ minutes: 2 }], 1)[0]!.minutes).toBe(2));
});
describe("shutdown ritual", () => {
  test("offered from 21:00", () => { expect(isShutdownTime(20)).toBe(false); expect(isShutdownTime(21)).toBe(true); });
  test("tomorrow's free position", () => { expect(freeTopPosition([1, 3])).toBe(2); expect(freeTopPosition([1, 2, 3])).toBeNull(); });
});
describe("dopamine cage", () => {
  test("each unrecovered breach costs 10 xp", () => expect(breachPenalty(2)).toBe(20));
  test("xp never goes negative", () => expect(totalXp({ logs: 0, tasks: 0, workouts: 0, journal: 0, books: 0, breaches: 3 })).toBe(0));
  test("recovered breach restores xp", () => expect(totalXp({ logs: 1, tasks: 0, workouts: 0, journal: 0, books: 0, breaches: 0 })).toBe(10));
});
describe("archetypes", () => {
  test("never overwrite filled hours", () => expect(blocksToApply("developer", [9]).some((b) => b.hour === 9)).toBe(false));
  test("archetype sets the engine's daily focus action", () => {
    const base: EngineInput = { profile: {}, history: [], habitsTotal: 0, habitsDoneToday: 0, sleepHours: null, todayISO: "2026-11-08", archetype: "student" };
    expect(decide(base).actions.some((a) => a.title.includes("pomodoro"))).toBe(true);
  });
  test("low energy input yields one action", () => {
    const base: EngineInput = { profile: { main_goal: "IT" }, history: [], habitsTotal: 0, habitsDoneToday: 0, sleepHours: null, todayISO: "2026-11-08", energy: 1 };
    expect(decide(base).actions).toHaveLength(1);
  });
});
describe("shutdown carry-over", () => {
  test("up to two postponed items move to the next day", () => {
    const h = (title: string) => ({ plan_date: "2026-11-07", title, status: "postponed", minutes: 10, domain: "reja", skip_reason: "x" });
    const plan = decide({ profile: {}, history: [h("A"), h("B"), h("C")], habitsTotal: 0, habitsDoneToday: 0, sleepHours: null, todayISO: "2026-11-08" });
    expect(plan.actions.filter((a) => a.source === "carry").map((a) => a.title)).toEqual(["A", "B"]);
  });
  test("shutdown not offered after midnight", () => expect(isShutdownTime(0)).toBe(false));
});
