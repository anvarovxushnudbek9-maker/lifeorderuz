export function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function lastNDays(n: number) {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const off = d.getTimezoneOffset();
    out.push(new Date(d.getTime() - off * 60000).toISOString().slice(0, 10));
  }
  return out;
}

export const WEEKDAYS_UZ = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];

export function shortDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}
