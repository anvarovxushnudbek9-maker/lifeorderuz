// Life Engine: Understand → Diagnose → Decide. Deterministic rules on verified
// user data, so the daily plan works even when AI is unavailable.

export type EngineProfile = {
  main_goal?: string | null;
  goal_type?: string | null;
  biggest_obstacle?: string | null;
  focus_areas?: string[] | null;
  activity_level?: string | null;
  digital_habits?: Record<string, string> | null;
};

export type PastItem = {
  plan_date: string;
  title: string;
  status: string;
  skip_reason: string | null;
  minutes: number;
  domain: string;
};

export type PlannedAction = {
  title: string;
  why: string;
  domain: string;
  minutes: number;
  source: "engine" | "carry";
};

export type Diagnosis = {
  key: "phone" | "procrastination" | "perfectionism" | "time" | "energy" | "clarity";
  label: string;
  explain: string;
};

export const SKIP_REASONS = [
  "Telefon chalg'itdi",
  "Vaqt yetmadi",
  "Charchadim",
  "Juda katta tuyuldi",
  "Unutib qo'ydim",
] as const;

export type EngineInput = {
  profile: EngineProfile;
  history: PastItem[]; // last ~14 days, excluding today
  habitsTotal: number;
  habitsDoneToday: number;
  sleepHours: number | null;
  todayISO: string;
};

function completionRate(history: PastItem[]) {
  const closed = history;
  if (!closed.length) return null;
  return closed.filter((h) => h.status === "done").length / closed.length;
}

function topReason(history: PastItem[]) {
  const counts = new Map<string, number>();
  for (const h of history) if (h.skip_reason) counts.set(h.skip_reason, (counts.get(h.skip_reason) ?? 0) + 1);
  let best: string | null = null;
  let n = 0;
  for (const [k, v] of counts) if (v > n) { best = k; n = v; }
  return n >= 2 ? best : null;
}

export function diagnose(input: EngineInput): Diagnosis {
  const d = input.profile.digital_habits ?? {};
  const reason = topReason(input.history);
  const rate = completionRate(input.history);
  if (reason === "Telefon chalg'itdi" || input.profile.biggest_obstacle === "Telefon chalg'itadi" || d["screen_time"] === "6 soatdan ko'p" || d["screen_time"] === "4–6 soat")
    return { key: "phone", label: "Telefon diqqatni o'g'irlayapti", explain: reason ? "Oxirgi kunlarda vazifalar ko'pincha telefon sabab qoldi." : "Kuniga 4+ soat ekran vaqti — reja uchun eng katta to'siq." };
  if (reason === "Juda katta tuyuldi" || d["start_style"] === "Mukammal bo'lishini kutaman")
    return { key: "perfectionism", label: "Mukammallikni kutish", explain: "Vazifalar katta tuyulgani uchun boshlanmayapti — ularni kichraytiramiz." };
  if (reason === "Vaqt yetmadi" || input.profile.biggest_obstacle === "Vaqt topa olmayman")
    return { key: "time", label: "Vaqt yetishmovchiligi", explain: "Rejani mavjud bo'sh vaqtingizga sig'diramiz." };
  if (reason === "Charchadim" || input.profile.biggest_obstacle === "Charchoq va energiya" || (input.sleepHours !== null && input.sleepHours > 0 && input.sleepHours < 6))
    return { key: "energy", label: "Energiya past", explain: "Uyqu va charchoq bajarilishni pasaytiryapti." };
  if (input.profile.biggest_obstacle === "Nimadan boshlashni bilmayman")
    return { key: "clarity", label: "Aniqlik yetishmaydi", explain: "Bitta aniq birinchi qadam belgilaymiz." };
  if ((rate !== null && rate < 0.5) || input.profile.biggest_obstacle === "Intizom yetishmaydi" || d["start_style"] === "Oxirgi daqiqagacha cho'zaman")
    return { key: "procrastination", label: "Kechiktirish", explain: rate !== null ? `Oxirgi rejalar bajarilishi ${Math.round(rate * 100)}% — yuklamani kamaytiramiz.` : "Boshlashni osonlashtiramiz: 2 daqiqalik qoida." };
  return { key: "clarity", label: "Barqarorlik", explain: "Yaxshi ritmdasiz — muhim ishga ko'proq vaqt ajratamiz." };
}

function freeMinutes(p: EngineProfile) {
  const f = p.digital_habits?.["free_time"];
  if (f === "30 daqiqadan kam") return 25;
  if (f === "30–60 daqiqa") return 50;
  if (f === "1–2 soat") return 90;
  if (f === "2 soatdan ko'p") return 150;
  return 60;
}

export function decide(input: EngineInput): { diagnosis: Diagnosis; actions: PlannedAction[]; load: number } {
  const diagnosis = diagnose(input);
  const rate = completionRate(input.history);
  // Adapt load: shrink after weak days, grow slowly after strong ones.
  let load = 1;
  if (rate !== null && rate < 0.4) load = 0.5;
  else if (rate !== null && rate < 0.7) load = 0.75;
  else if (rate !== null && rate > 0.9 && input.history.length >= 6) load = 1.2;
  if (diagnosis.key === "perfectionism" || diagnosis.key === "energy") load = Math.min(load, 0.75);
  const budget = Math.max(15, Math.round(freeMinutes(input.profile) * load));
  const mins = (m: number) => Math.max(2, Math.round(m * load));

  const actions: PlannedAction[] = [];

  // 1. Carry over yesterday's postponed items (max 1) — unfinished work first.
  const yesterday = [...input.history].sort((a, b) => b.plan_date.localeCompare(a.plan_date));
  const carry = yesterday.find((h) => h.status === "postponed");
  if (carry) actions.push({ title: carry.title, why: "Kecha keyinga surilgan edi — bugun birinchi navbatda.", domain: carry.domain, minutes: Math.min(carry.minutes, mins(30)), source: "carry" });

  // 2. Main goal: the one action that moves the needle.
  const goal = input.profile.main_goal?.trim();
  if (goal && actions.length < 3) {
    const m = diagnosis.key === "perfectionism" || diagnosis.key === "procrastination" ? mins(10) : mins(30);
    actions.push({
      title: `${m} daqiqa: "${goal.slice(0, 60)}" uchun bitta kichik qadam`,
      why: diagnosis.key === "perfectionism" ? "Mukammal emas, boshlangan bo'lsin — qoralama ham hisob." : "Asosiy maqsadingizni har kuni oldinga suradigan yagona ish.",
      domain: "maqsad",
      minutes: m,
      source: "engine",
    });
  }

  // 3. Root-cause intervention.
  const fix: Record<Diagnosis["key"], PlannedAction> = {
    phone: { title: "25 daqiqa telefonni boshqa xonaga qo'yib fokus", why: "Ekran vaqti asosiy to'siq — telefonsiz bitta blok rejani saqlaydi.", domain: "fokus", minutes: 25, source: "engine" },
    procrastination: { title: "2 daqiqa qoidasi: eng og'ir ishni faqat boshlang", why: "Boshlash eng qiyin qism. 2 daqiqadan keyin to'xtashingiz mumkin.", domain: "fokus", minutes: 2, source: "engine" },
    perfectionism: { title: "Bitta ishni \"yetarlicha yaxshi\" holatda yakunlang", why: "Tugallangan ish mukammal rejadan qimmatroq.", domain: "fokus", minutes: mins(15), source: "engine" },
    time: { title: "Ertangi kun uchun 5 daqiqalik reja yozing", why: "Vaqt yetmasa, uni oldindan taqsimlash kerak.", domain: "reja", minutes: 5, source: "engine" },
    energy: { title: "Bugun 23:00 gacha uxlashga yotish", why: "Uyqu kamligi ertangi bajarilishni pasaytiradi.", domain: "tana", minutes: 5, source: "engine" },
    clarity: { title: "Maqsadga olib boradigan 3 ta keyingi qadamni yozing", why: "Aniq qadam bo'lsa, boshlash oson.", domain: "reja", minutes: 10, source: "engine" },
  };
  if (actions.length < 3) actions.push(fix[diagnosis.key]);

  // 4. Body / habits by goal.
  if (actions.length < 3) {
    if (input.habitsTotal > 0 && input.habitsDoneToday < input.habitsTotal)
      actions.push({ title: "Bugungi odatlaringizni belgilang", why: `${input.habitsTotal - input.habitsDoneToday} ta odat kutmoqda — zanjirni uzmang.`, domain: "odat", minutes: 10, source: "engine" });
    else if (input.profile.goal_type === "lose" || input.profile.goal_type === "gain" || input.profile.activity_level === "low")
      actions.push({ title: `${mins(20)} daqiqa yurish yoki mashq`, why: "Harakat energiya va kayfiyatni ko'taradi.", domain: "tana", minutes: mins(20), source: "engine" });
    else
      actions.push({ title: "10 bet kitob o'qing", why: "Bilim — kichik kunlik qo'shimchalar.", domain: "bilim", minutes: 15, source: "engine" });
  }

  // Fit into time budget: drop the last action if over.
  let total = actions.reduce((s, a) => s + a.minutes, 0);
  while (actions.length > 1 && total > budget) {
    actions.pop();
    total = actions.reduce((s, a) => s + a.minutes, 0);
  }
  return { diagnosis, actions, load };
}
