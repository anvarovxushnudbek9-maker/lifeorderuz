export const ONBOARDING_GROUPS = [
  ["main_goal", "why_now"],
  ["biggest_obstacle", "start_style"],
  ["screen_time", "morning_phone"],
  ["free_time", "peak_time", "life_stage"],
  ["activity_level", "goal_type", "sport_preference"],
] as const;

export function isMinorAge(value: string) {
  const age = Number(value);
  return Number.isInteger(age) && age >= 13 && age < 18;
}

export function onboardingError(answers: Record<string, string>, step: number): string | null {
  const keys = ONBOARDING_GROUPS[step];
  if (!keys || keys.some((key) => !answers[key]?.trim())) return "Har bir savolga javob tanlang.";
  if (step !== 4) return null;
  if (!answers["full_name"]?.trim() || answers["full_name"].trim().length > 80) return "Ismingizni kiriting (80 belgigacha).";
  const age = Number(answers["age"]);
  if (!Number.isInteger(age) || age < 13 || age > 110) return "Yoshni 13 dan 110 gacha kiriting.";
  if (isMinorAge(answers["age"] ?? "") && ["lose", "gain"].includes(answers["goal_type"] ?? "")) return "18 yoshgacha vazn o‘zgartirish o‘rniga sog‘lom harakatni tanlang.";
  for (const [key, min, max] of [["height_cm", 80, 250], ["weight_kg", 20, 300]] as const) {
    const value = answers[key];
    if (value && (!Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max)) return key === "height_cm" ? "Bo‘y 80–250 sm oralig‘ida bo‘lsin." : "Vazn 20–300 kg oralig‘ida bo‘lsin.";
  }
  return null;
}