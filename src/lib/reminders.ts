import type { Database } from "@/integrations/supabase/types";

export type Reminder = Database["public"]["Tables"]["reminders"]["Row"];

export function localISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Whether a reminder applies to the given local date. */
export function appliesOn(r: Reminder, date = new Date()) {
  const iso = localISO(date);
  if (r.repeat === "daily") return r.remind_date <= iso;
  if (r.repeat === "weekdays") {
    const wd = date.getDay();
    return r.remind_date <= iso && wd !== 0 && wd !== 6;
  }
  return r.remind_date === iso;
}

export function isDone(r: Reminder, date = new Date()) {
  return (r.done_on ?? []).includes(localISO(date));
}

export function hhmm(t: string | null | undefined) {
  return t ? t.slice(0, 5) : "";
}

export const REPEAT_LABEL: Record<string, string> = {
  none: "Bir marta",
  daily: "Har kuni",
  weekdays: "Ish kunlari",
};
