import { expect, test } from "bun:test";
import { planStatus, PREMIUM_MONTHLY_UZS, TRIAL_DAYS } from "./entitlements";
const start = Date.parse("2026-11-12T00:00:00Z");
const entitlement = { trial_ends_at: "2026-11-19T00:00:00Z", premium_until: null };
test("trial lasts exactly seven days and ends at its deadline", () => {
  expect(TRIAL_DAYS).toBe(7);
  expect(planStatus(entitlement, start).days).toBe(7);
  expect(planStatus(entitlement, start + 7 * 86400000).kind).toBe("free");
});
test("expired trial preserves three free daily AI requests", () => {
  expect(planStatus(entitlement, start + 8 * 86400000).aiDaily).toBe(3);
});
test("unverified payment is never an entitlement", () => {
  expect(planStatus(null, start).kind).toBe("free");
  expect(PREMIUM_MONTHLY_UZS).toBe(49000);
});