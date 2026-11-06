import { expect, test } from "bun:test";
import { aiLimitReached, FREE_AI_DAILY_LIMIT } from "./ai-limits";

test("free plan allows 3 AI requests per day", () => {
  expect(FREE_AI_DAILY_LIMIT).toBe(3);
  expect(aiLimitReached(0, 2)).toBe(false);
  expect(aiLimitReached(0, 3)).toBe(true);
});
