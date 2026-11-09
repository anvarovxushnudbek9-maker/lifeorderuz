import { expect, test } from "bun:test";
import { dailyWisdom } from "./daily-wisdom";

test("same calendar day returns the same lesson", () => {
  expect(dailyWisdom("2026-11-09")).toEqual(dailyWisdom("2026-11-09"));
});
test("consecutive calendar days change the practical lesson", () => {
  expect(dailyWisdom("2026-11-10").action).not.toBe(dailyWisdom("2026-11-09").action);
});