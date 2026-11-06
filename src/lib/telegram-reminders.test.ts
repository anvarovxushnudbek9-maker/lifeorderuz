import { describe, expect, test } from "bun:test";
import { localClock, parseStartCode, pickDue, type DueCandidate } from "./telegram-reminders";

const base: DueCandidate = { id: "a", title: "Kitob", start_time: "09:00:00", end_time: null, remind_date: "2026-11-02", repeat: "daily", done_on: [], note: null };
const clock = { date: "2026-11-06", minutes: 9 * 60 + 3 };

describe("telegram reminders", () => {
  test("sends a daily reminder within 10 minutes of its start", () => {
    expect(pickDue([base], clock, new Set()).map((r) => r.id)).toEqual(["a"]);
  });
  test("does not send after the 10-minute window", () => {
    expect(pickDue([base], { ...clock, minutes: 9 * 60 + 11 }, new Set())).toEqual([]);
  });
  test("does not resend or send done reminders", () => {
    expect(pickDue([base], clock, new Set(["a"]))).toEqual([]);
    expect(pickDue([{ ...base, done_on: ["2026-11-06"] }], clock, new Set())).toEqual([]);
  });
  test("caps Telegram reminders at 5 per day", () => {
    const sent = new Set(["x1", "x2", "x3", "x4"]);
    const many = ["b", "c", "d"].map((id) => ({ ...base, id }));
    expect(pickDue(many, clock, sent)).toHaveLength(1);
  });
  test("weekday reminders skip Saturday", () => {
    expect(pickDue([{ ...base, repeat: "weekdays" }], { ...clock, date: "2026-11-07" }, new Set())).toEqual([]);
  });
  test("uses the user's time zone", () => {
    expect(localClock(new Date("2026-11-06T04:30:00Z"), "Asia/Tashkent")).toEqual({ date: "2026-11-06", minutes: 9 * 60 + 30 });
  });
  test("parses only valid start codes", () => {
    expect(parseStartCode("/start abcdefghijklmnop1234")).toBe("abcdefghijklmnop1234");
    expect(parseStartCode("/start short")).toBeNull();
  });
});
