import { describe, expect, test } from "bun:test";
import { distractionMap, waterGoalMl } from "./day-rules";

describe("day rules", () => {
  test("water goal defaults to 2000 ml without weight", () => expect(waterGoalMl(null)).toBe(2000));
  test("water goal is 33 ml/kg rounded to a glass", () => expect(waterGoalMl(70)).toBe(2250));
  test("water goal is capped at 4000 ml", () => expect(waterGoalMl(200)).toBe(4000));
  test("distraction map sums by source, biggest first", () =>
    expect(distractionMap([{ source: "TikTok", minutes: 20 }, { source: "YouTube", minutes: 30 }, { source: "TikTok", minutes: 25 }]))
      .toEqual([{ source: "TikTok", minutes: 45 }, { source: "YouTube", minutes: 30 }]));
});
