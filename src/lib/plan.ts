export type GoalType =
  | "lose"
  | "maintain"
  | "gain"
  | "strength"
  | "endurance"
  | "health";

export const GOALS: { v: GoalType; t: string; d: string }[] = [
  { v: "lose", t: "Vazn kamaytirish", d: "Yog' yoqish, kaloriya taqchilligi" },
  { v: "maintain", t: "Vaznni saqlash", d: "Barqaror shakl va energiya" },
  { v: "gain", t: "Vazn ko'paytirish", d: "Mushak massasi, kaloriya ortiqchaligi" },
  { v: "strength", t: "Kuch", d: "Og'irlik bilan kuch oshirish" },
  { v: "endurance", t: "Chidamlilik", d: "Yurak-qon tomir va nafas" },
  { v: "health", t: "Umumiy sog'liq", d: "Uyqu, harakat, muvozanat" },
];

export const SPORTS = [
  "Zal (kuch mashqlari)",
  "Uy sharoitida",
  "Yugurish",
  "Velosiped",
  "Suzish",
  "Yoga / cho'zilish",
  "Jang san'ati",
  "Futbol / jamoaviy",
];

const ACTIVITY_FACTOR: Record<string, number> = {
  low: 1.2,
  light: 1.375,
  medium: 1.55,
  high: 1.725,
};

export type ProfileInput = {
  age?: number | null;
  gender?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  activity_level?: string | null;
  goal_type?: string | null;
};

export type NutritionPlan = {
  bmr: number;
  tdee: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  note: string;
};

export function bmiOf(height_cm?: number | null, weight_kg?: number | null) {
  const h = Number(height_cm ?? 0);
  const w = Number(weight_kg ?? 0);
  if (h <= 0 || w <= 0) return null;
  return w / (h / 100) ** 2;
}

export function bmiLabel(bmi: number | null) {
  if (bmi === null) return "—";
  if (bmi < 18.5) return "Kam vazn";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Ortiqcha";
  return "Semizlik";
}

export function buildNutrition(p: ProfileInput): NutritionPlan | null {
  const age = Number(p.age ?? 0);
  const h = Number(p.height_cm ?? 0);
  const w = Number(p.weight_kg ?? 0);
  if (!age || !h || !w) return null;

  const s = p.gender === "female" ? -161 : 5;
  const bmr = Math.round(10 * w + 6.25 * h - 5 * age + s);
  const factor = ACTIVITY_FACTOR[p.activity_level ?? "light"] ?? 1.375;
  const tdee = Math.round(bmr * factor);

  const goal = (p.goal_type ?? "maintain") as GoalType;
  const adj: Record<GoalType, number> = {
    lose: -0.18,
    maintain: 0,
    gain: 0.15,
    strength: 0.1,
    endurance: 0.05,
    health: 0,
  };
  const kcal = Math.round(tdee * (1 + (adj[goal] ?? 0)));

  const proteinPerKg = goal === "lose" || goal === "strength" || goal === "gain" ? 2 : 1.6;
  const protein = Math.round(w * proteinPerKg);
  const fat = Math.round((kcal * (goal === "lose" ? 0.27 : 0.25)) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const water = Math.round(w * 35);

  const note =
    goal === "lose"
      ? "Sekin va barqaror: haftasiga 0.5–0.7 kg. Oqsilni yuqori ushlang, mushak saqlanadi."
      : goal === "gain"
        ? "Haftasiga ~0.25–0.5 kg qo'shing. Kaloriyani ovqat sifatidan qurbon qilmang."
        : goal === "strength"
          ? "Kuch uchun oqsil va uyqu birinchi o'rinda. Har hafta og'irlikni bir oz oshiring."
          : goal === "endurance"
            ? "Uglevod — yoqilg'ingiz. Uzoq mashqdan oldin va keyin to'ldiring."
            : "Muvozanat: yetarli oqsil, ko'p sabzavot, barqaror uyqu.";

  return { bmr, tdee, kcal, protein, carbs, fat, water, note };
}

export type WorkoutDay = { day: string; focus: string; detail: string };

const DAYS = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];

export function buildWorkoutPlan(goal: string | null | undefined, sport: string | null | undefined): WorkoutDay[] {
  const g = (goal ?? "health") as GoalType;
  const s = sport ?? "Uy sharoitida";

  const strengthBlocks = [
    { focus: "Tepa tana (itarish)", detail: "Ko'krak, yelka, tritseps — 4 mashq × 3 set" },
    { focus: "Pastki tana", detail: "Cho'kkalash, o'lik tortish, oyoq — 4 mashq × 3 set" },
    { focus: "Tepa tana (tortish)", detail: "Orqa, bitseps — 4 mashq × 3 set" },
    { focus: "To'liq tana", detail: "Kompleks mashqlar + qorin — 5 mashq × 3 set" },
  ];
  const cardio = { focus: "Kardio", detail: `${s} — 30–45 daqiqa, o'rtacha temp` };
  const easy = { focus: "Yengil harakat", detail: "8–10 ming qadam yoki 20 daqiqa cho'zilish" };
  const rest = { focus: "Dam olish", detail: "Tiklanish: uyqu, suv, yengil yurish" };

  let week: { focus: string; detail: string }[];
  switch (g) {
    case "lose":
      week = [strengthBlocks[0]!, cardio, strengthBlocks[1]!, cardio, strengthBlocks[3]!, easy, rest];
      break;
    case "gain":
    case "strength":
      week = [
        strengthBlocks[0]!,
        strengthBlocks[1]!,
        rest,
        strengthBlocks[2]!,
        strengthBlocks[3]!,
        easy,
        rest,
      ];
      break;
    case "endurance":
      week = [
        cardio,
        { focus: "Interval", detail: `${s} — 8×1 daqiqa tez / 2 daqiqa sekin` },
        easy,
        cardio,
        strengthBlocks[3]!,
        { focus: "Uzoq mashg'ulot", detail: `${s} — 60–90 daqiqa sekin temp` },
        rest,
      ];
      break;
    case "maintain":
      week = [strengthBlocks[3]!, cardio, easy, strengthBlocks[0]!, cardio, easy, rest];
      break;
    default:
      week = [easy, cardio, easy, strengthBlocks[3]!, cardio, easy, rest];
  }

  return week.map((w, i) => ({ day: DAYS[i]!, ...w }));
}
