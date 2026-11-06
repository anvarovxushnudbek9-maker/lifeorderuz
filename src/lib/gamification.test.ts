import { describe, expect, test } from "bun:test";
import { levelFor, streakWithFreeze, totalXp } from "./gamification";

const days = ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8"];
describe("gamification", () => {
  test("xp weights", () => expect(totalXp({ logs: 1, tasks: 1, workouts: 1, journal: 1, books: 1 })).toBe(60));
  test("level 2 starts at 100 xp", () => { expect(levelFor(99).level).toBe(1); expect(levelFor(100).level).toBe(2); });
  test("level 3 starts at 300 xp", () => expect(levelFor(300).level).toBe(3));
  test("one missed day is frozen", () => expect(streakWithFreeze((d) => d !== "d5", days)).toEqual({ streak: 7, frozen: 1 }));
  test("two misses within a week break the streak", () => expect(streakWithFreeze((d) => d !== "d5" && d !== "d3", days).streak).toBe(4));
  test("unmarked today does not break", () => expect(streakWithFreeze((d) => d !== "d8", days).streak).toBe(7));
});
