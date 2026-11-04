import { describe, expect, test } from "bun:test";
import { ONBOARDING_GROUPS, isMinorAge, onboardingError } from "./onboarding";

describe("confirmed onboarding rules", () => {
  test("has exactly five main screens", () => {
    expect(ONBOARDING_GROUPS.length).toBe(5);
  });
  test("accepts age 13 and rejects age 12", () => {
    const answers = { full_name: "Test", age: "13", activity_level: "light", goal_type: "health", sport_preference: "Suzish" };
    expect(onboardingError(answers, 4)).toBeNull();
    expect(onboardingError({ ...answers, age: "12" }, 4)).not.toBeNull();
  });
  test("does not prescribe weight changes for minors", () => {
    expect(isMinorAge("17")).toBe(true);
    expect(isMinorAge("18")).toBe(false);
    expect(onboardingError({ full_name: "Test", age: "16", activity_level: "light", goal_type: "lose", sport_preference: "Suzish" }, 4)).not.toBeNull();
  });
});