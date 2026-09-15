import {
  User,
  HeartPulse,
  ListChecks,
  GraduationCap,
  Users,
  NotebookPen,
  Target,
  Trophy,
  Dumbbell,
  Apple,
  BarChart3,
  CalendarDays,
  BookOpen,
  Sparkles,
  Salad,
  type LucideIcon,
} from "lucide-react";

export type HubModule = {
  to:
    | "/profil"
    | "/kundalik"
    | "/maqsad"
    | "/yutuqlar"
    | "/tana"
    | "/shaxsiy-reja"
    | "/analiz"
    | "/odat"
    | "/reja"
    | "/bilim"
    | "/ai"
    | "/davra";
  label: string;
  desc: string;
  icon: LucideIcon;
};

export type Hub = {
  slug: "self" | "health" | "productivity" | "growth" | "life";
  label: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  modules: HubModule[];
};

export const HUBS: Hub[] = [
  {
    slug: "self",
    label: "Self",
    title: "Self — O'zlik",
    subtitle: "O'zingizni bilish: kundalik, maqsad, yutuqlar.",
    icon: User,
    modules: [
      { to: "/kundalik", label: "Kundalik", desc: "Kun yakuni va kayfiyat", icon: NotebookPen },
      { to: "/maqsad", label: "Maqsadlar", desc: "Asosiy maqsad va yo'nalishlar", icon: Target },
      { to: "/yutuqlar", label: "Yutuqlar", desc: "Belgilar va bosqichlar", icon: Trophy },
      { to: "/profil", label: "Profil", desc: "Shaxsiy ma'lumotlar", icon: User },
    ],
  },
  {
    slug: "health",
    label: "Health",
    title: "Health — Salomatlik",
    subtitle: "Tana, ovqat, mashq va tiklanish.",
    icon: HeartPulse,
    modules: [
      { to: "/tana", label: "Tana", desc: "Mashq, ovqat, uyqu, suv", icon: Dumbbell },
      { to: "/shaxsiy-reja", label: "Kkal va makro reja", desc: "Shaxsiy ovqat va mashq rejasi", icon: Salad },
      { to: "/tana", label: "Ovqatlanish", desc: "Kunlik kaloriya va oqsil", icon: Apple },
      { to: "/analiz", label: "Tana tahlili", desc: "14 kunlik grafiklar", icon: BarChart3 },
    ],
  },
  {
    slug: "productivity",
    label: "Productivity",
    title: "Productivity — Samaradorlik",
    subtitle: "Odatlar, haftalik reja va intizom.",
    icon: ListChecks,
    modules: [
      { to: "/odat", label: "Odatlar", desc: "Kunlik odatlarni belgilash", icon: ListChecks },
      { to: "/reja", label: "Haftalik reja", desc: "7 kunlik jadval", icon: CalendarDays },
      { to: "/analiz", label: "Statistika", desc: "Bajarilish darajasi", icon: BarChart3 },
    ],
  },
  {
    slug: "growth",
    label: "Growth",
    title: "Growth — O'sish",
    subtitle: "Kitoblar, kurslar va AI murabbiy.",
    icon: GraduationCap,
    modules: [
      { to: "/bilim", label: "Kutubxona", desc: "Kitob va kurslar", icon: BookOpen },
      { to: "/ai", label: "AI murabbiy", desc: "Shaxsiy tahlil va maslahat", icon: Sparkles },
      { to: "/yutuqlar", label: "Bosqichlar", desc: "O'sish belgilari", icon: Trophy },
    ],
  },
  {
    slug: "life",
    label: "Life",
    title: "Life — Hayot",
    subtitle: "Davra, muhit va kundalik muvozanat.",
    icon: Users,
    modules: [
      { to: "/davra", label: "Davra", desc: "Maqsaddoshlar bilan suhbat", icon: Users },
      { to: "/kundalik", label: "Kun yakuni", desc: "Minnatdorchilik va xulosa", icon: NotebookPen },
      { to: "/maqsad", label: "Hayot yo'nalishlari", desc: "Fokus sohalari", icon: Target },
    ],
  },
];

export function hubBySlug(slug: string) {
  return HUBS.find((h) => h.slug === slug);
}
