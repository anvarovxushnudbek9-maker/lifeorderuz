import { BookOpen } from "lucide-react";
import { dailyWisdom } from "@/lib/daily-wisdom";

export function DailyWisdom({ date }: { date: string }) {
  const wisdom = dailyWisdom(date);
  return <aside className="mb-5 border-l-2 border-primary py-2 pl-4">
    <p className="flex items-center gap-2 text-xs text-muted-foreground"><BookOpen className="size-4" />{wisdom.thinker} g‘oyalaridan — erkin talqin</p>
    <p className="mt-2 text-sm font-medium">{wisdom.lesson}</p>
    <p className="mt-1 text-sm text-muted-foreground">{wisdom.action}</p>
  </aside>;
}