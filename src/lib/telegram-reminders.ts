// Pure scheduling rules for Telegram reminder delivery (tested with Bun).

export const MAX_TELEGRAM_REMINDERS_PER_DAY = 5;
/** Only send a reminder up to this many minutes after its start time. */
export const SEND_WINDOW_MIN = 10;

export type DueCandidate = {
  id: string;
  title: string;
  start_time: string; // "HH:MM" or "HH:MM:SS"
  end_time: string | null;
  remind_date: string; // YYYY-MM-DD
  repeat: string;
  done_on: string[] | null;
  note: string | null;
};

/** Local date (YYYY-MM-DD) and minutes-since-midnight in a time zone. */
export function localClock(now: Date, timeZone: string): { date: string; minutes: number } {
  let tz = timeZone;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
  } catch {
    tz = "Asia/Tashkent";
  }
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts["year"]}-${parts["month"]}-${parts["day"]}`,
    minutes: Number(parts["hour"]) * 60 + Number(parts["minute"]),
  };
}

function toMinutes(t: string) {
  const [h, m] = t.split(":");
  return Number(h) * 60 + Number(m);
}

export function appliesOnDate(r: Pick<DueCandidate, "remind_date" | "repeat">, date: string) {
  if (r.repeat === "daily") return r.remind_date <= date;
  if (r.repeat === "weekdays") {
    const wd = new Date(`${date}T12:00:00Z`).getUTCDay();
    return r.remind_date <= date && wd !== 0 && wd !== 6;
  }
  return r.remind_date === date;
}

/**
 * Reminders that should be sent now: applicable today, not done, started within
 * the send window, not already delivered, capped per day.
 */
export function pickDue(
  reminders: DueCandidate[],
  clock: { date: string; minutes: number },
  alreadySent: Set<string>,
): DueCandidate[] {
  const remaining = Math.max(0, MAX_TELEGRAM_REMINDERS_PER_DAY - alreadySent.size);
  return reminders
    .filter((r) => !alreadySent.has(r.id))
    .filter((r) => appliesOnDate(r, clock.date))
    .filter((r) => !(r.done_on ?? []).includes(clock.date))
    .filter((r) => {
      const start = toMinutes(r.start_time);
      return clock.minutes >= start && clock.minutes - start <= SEND_WINDOW_MIN;
    })
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .slice(0, remaining);
}

export function reminderText(r: DueCandidate) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const time = r.end_time ? `${r.start_time.slice(0, 5)}–${r.end_time.slice(0, 5)}` : r.start_time.slice(0, 5);
  return [`⏰ <b>${esc(r.title)}</b>`, time, r.note ? esc(r.note) : "", "", "Bajarganingizni Life Order’da belgilang."]
    .filter((l, i) => l !== "" || i === 3)
    .join("\n");
}

/** Extract the link code from a "/start CODE" message. */
export function parseStartCode(text: string | undefined | null): string | null {
  const m = /^\/start(?:@\w+)?\s+([A-Za-z0-9_-]{16,64})\s*$/.exec(text ?? "");
  return m?.[1] ?? null;
}
