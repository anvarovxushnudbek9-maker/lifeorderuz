// Sprint 1 Life OS rules: energy-adaptive plan, shutdown ritual, dopamine recovery, day archetypes.
// Pure, deterministic functions so they can be tested and work without AI.

export type Energy = 1 | 2 | 3;
export const ENERGY_OPTIONS: { value: Energy; label: string; hint: string }[] = [
  { value: 1, label: "Juda past", hint: "Charchaganman" },
  { value: 2, label: "O‘rtacha", hint: "Odatiy kun" },
  { value: 3, label: "Yuqori", hint: "Jangovar holat" },
];

/** Low energy: only the single most important item stays, with half the minutes. High/medium: unchanged (max 3). */
export function applyEnergy<T extends { minutes: number }>(actions: T[], energy: Energy | null): T[] {
  if (energy === 1) return actions.slice(0, 1).map((a) => ({ ...a, minutes: Math.max(2, Math.round(a.minutes / 2)) }));
  return actions.slice(0, 3);
}
export function energyMessage(energy: Energy | null) {
  if (energy === 1) return "Bugun tana tiklanishi kuni. Faqat bitta eng muhim qadam — bu ham g‘alaba.";
  if (energy === 3) return "Quvvat yuqori — barcha 3 ta asosiy qadam to‘liq rejada.";
  if (energy === 2) return "O‘rtacha quvvat — reja odatdagidek.";
  return null;
}

/** Shutdown ritual is offered from 21:00 local time until 04:59. */
export function isShutdownTime(hour: number) {
  return hour >= 21 || hour < 5;
}
export const SHUTDOWN_CARRY = "Kun yopilishida ertaga ko‘chirildi";
export const SHUTDOWN_DROP = "Kun yopilishida rejadan olib tashlandi";

/** Lowest free top-3 position (1–3) for tomorrow, or null when all are taken. */
export function freeTopPosition(taken: number[]) {
  for (const p of [1, 2, 3]) if (!taken.includes(p)) return p;
  return null;
}

export const RECOVERY_TASKS = ["20 ta push-up (otjimaniye)", "5 sahifa kitob o‘qish"] as const;
export const BREACH_XP = 10;
/** XP lost for breaches that have not yet been recovered. */
export function breachPenalty(unrecovered: number) {
  return Math.max(0, unrecovered) * BREACH_XP;
}

export type ArchetypeId = "developer" | "leader" | "student";
export type Archetype = {
  id: ArchetypeId;
  title: string;
  desc: string;
  blocks: { hour: number; title: string }[];
  action: { title: string; why: string; domain: string; minutes: number };
};
export const ARCHETYPES: Archetype[] = [
  {
    id: "developer", title: "Dasturchi / Aqliy mehnat", desc: "Chuqur fokus bloklari, ko‘z mashqi, kechki yurish",
    blocks: [
      { hour: 7, title: "Uyg‘onish, suv, telefonsiz 20 daqiqa" },
      { hour: 9, title: "Chuqur fokus bloki #1 (90 daq, bildirishnomalar o‘chiq)" },
      { hour: 11, title: "Ko‘z mashqi 20-20-20 va qisqa harakat" },
      { hour: 14, title: "Chuqur fokus bloki #2 (90 daq)" },
      { hour: 17, title: "Xat va uchrashuvlar (sayoz ishlar)" },
      { hour: 20, title: "Kechki yurish 30 daqiqa" },
      { hour: 23, title: "Uyqu" },
    ],
    action: { title: "90 daqiqalik chuqur fokus bloki", why: "Aqliy mehnatda natija uzluksiz fokusdan chiqadi.", domain: "fokus", minutes: 90 },
  },
  {
    id: "leader", title: "Tadbirkor / Lider", desc: "Ertalabki strategiya, delegatsiya, qat’iy aloqa vaqtlari",
    blocks: [
      { hour: 6, title: "Uyg‘onish, mashq, suv" },
      { hour: 7, title: "Strategiya: bugungi 3 ta hal qiluvchi qaror" },
      { hour: 9, title: "Eng muhim loyiha ustida ishlash" },
      { hour: 12, title: "Aloqa vaqti: qo‘ng‘iroq va xabarlar" },
      { hour: 15, title: "Delegatsiya va jamoa bilan uchrashuv" },
      { hour: 18, title: "Aloqa vaqti #2, keyin telefon yopiladi" },
      { hour: 22, title: "Uyqu" },
    ],
    action: { title: "10 daqiqa: bitta ishni boshqaga topshiring", why: "Lider vaqtini delegatsiya bo‘shatadi.", domain: "reja", minutes: 10 },
  },
  {
    id: "student", title: "Talaba / Izlanuvchi", desc: "Intensiv o‘rganish, pomodoro, uyqu tartibi",
    blocks: [
      { hour: 7, title: "Uyg‘onish, nonushta, suv" },
      { hour: 8, title: "Darslar / asosiy o‘qish" },
      { hour: 15, title: "Pomodoro 4×25 (takrorlash va mashq)" },
      { hour: 17, title: "Sport yoki yurish" },
      { hour: 19, title: "Pomodoro 2×25 (yangi mavzu)" },
      { hour: 21, title: "Ekransiz vaqt, ertangi kunga tayyorgarlik" },
      { hour: 22, title: "Uyqu (8 soat)" },
    ],
    action: { title: "2 ta pomodoro (25+5) bilan o‘rganish", why: "Qisqa intensiv bloklar xotirada yaxshi qoladi.", domain: "bilim", minutes: 55 },
  },
];
export const archetypeById = (id: string | null | undefined) => ARCHETYPES.find((a) => a.id === id) ?? null;

/** Template blocks only for hours the user has not filled — never overwrite own entries. */
export function blocksToApply(id: ArchetypeId, filledHours: number[]) {
  const a = archetypeById(id);
  return a ? a.blocks.filter((b) => !filledHours.includes(b.hour)) : [];
}
