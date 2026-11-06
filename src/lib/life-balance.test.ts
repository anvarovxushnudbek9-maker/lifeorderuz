import { expect, test } from "bun:test";
import { lifeBalance, weakest } from "./life-balance";

test("scores are capped at 100 and zero without habits", () => {
  const a = lifeBalance({ bodyDays: 7, learnDays: 0, habitLogs: 5, habitsTotal: 0, planDone: 3, planTotal: 6, circleMessages: 2 });
  expect(a.find((x) => x.key === "tana")?.score).toBe(100);
  expect(a.find((x) => x.key === "odat")?.score).toBe(0);
  expect(a.find((x) => x.key === "reja")?.score).toBe(50);
});

test("weakest area is flagged only below 40", () => {
  expect(weakest(lifeBalance({ bodyDays: 5, learnDays: 5, habitLogs: 7, habitsTotal: 1, planDone: 1, planTotal: 1, circleMessages: 5 }))).toBeNull();
  expect(weakest(lifeBalance({ bodyDays: 0, learnDays: 5, habitLogs: 7, habitsTotal: 1, planDone: 1, planTotal: 1, circleMessages: 5 }))?.key).toBe("tana");
});
