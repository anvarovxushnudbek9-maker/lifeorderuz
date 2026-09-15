import * as React from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  Moon,
  Sun,
  Dumbbell,
  BookOpen,
  LayoutGrid,
  CheckCircle2,
  Users,
  Plus,
  X,
  NotebookPen,
  Apple,
  BarChart3,
  Target,
  Trophy,
  Settings,
  LogOut,
  Sparkles,
  Library,
  CalendarDays,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { QuickAddDialog, type QuickAddKind } from "@/components/QuickAddDialog";

const NAV = [
  { to: "/tana", label: "Tana", icon: Dumbbell },
  { to: "/bilim", label: "Bilim", icon: BookOpen },
  { to: "/dashboard", label: "Asosiy", icon: LayoutGrid },
  { to: "/odat", label: "Odat", icon: CheckCircle2 },
  { to: "/davra", label: "Davra", icon: Users },
] as const;

const MENU_GROUPS = [
  {
    title: "Tahlil",
    items: [
      { to: "/analiz", label: "Analiz va statistika", icon: BarChart3 },
      { to: "/yutuqlar", label: "Yutuqlar", icon: Trophy },
    ],
  },
  {
    title: "Rejalashtirish",
    items: [
      { to: "/maqsad", label: "Maqsadlar", icon: Target },
      { to: "/kundalik", label: "Kundalik", icon: NotebookPen },
      { to: "/reja", label: "Haftalik reja", icon: CalendarDays },
    ],
  },
  {
    title: "Resurslar",
    items: [
      { to: "/bilim", label: "Kutubxona", icon: Library },
      { to: "/tana", label: "Salomatlik", icon: Heart },
      { to: "/ai", label: "AI murabbiy", icon: Sparkles },
    ],
  },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [fabOpen, setFabOpen] = React.useState(false);
  const [quick, setQuick] = React.useState<QuickAddKind | null>(null);

  const initials = (user?.user_metadata?.["full_name"] ?? user?.email ?? "U")
    .toString()
    .slice(0, 2)
    .toUpperCase();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const miniFabs = [
    { kind: "journal" as const, label: "Kundalik yozuv", icon: NotebookPen },
    { kind: "habit" as const, label: "Odat qo'shish", icon: CheckCircle2 },
    { kind: "workout" as const, label: "Mashq", icon: Dumbbell },
    { kind: "meal" as const, label: "Ovqat", icon: Apple },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menyu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto p-0">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="text-left text-base">Barcha funksiyalar</SheetTitle>
              </SheetHeader>
              <nav className="space-y-6 px-3 py-4">
                {MENU_GROUPS.map((group) => (
                  <div key={group.title}>
                    <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {group.title}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          <item.icon className="size-4 text-primary" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="border-t border-border pt-4">
                  <Link
                    to="/profil"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <Settings className="size-4 text-primary" />
                    Sozlamalar
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/dashboard" className="text-sm font-bold tracking-tight">
            Life Order
          </Link>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Mavzu">
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/profil" })}>
                  <Settings className="mr-2 size-4" /> Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/analiz" })}>
                  <BarChart3 className="mr-2 size-4" /> Analiz
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 size-4" /> Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5">{children}</main>

      {/* FABs */}
      <div className="pointer-events-none fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3">
        {fabOpen &&
          miniFabs.map((f) => (
            <button
              key={f.kind}
              onClick={() => {
                setFabOpen(false);
                setQuick(f.kind);
              }}
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium shadow-lg transition hover:bg-accent"
            >
              <f.icon className="size-4 text-primary" />
              {f.label}
            </button>
          ))}

        <button
          onClick={() => setFabOpen((v) => !v)}
          aria-label="Tez qo'shish"
          className="pointer-events-auto flex size-11 items-center justify-center rounded-full border border-border bg-card shadow-lg transition hover:bg-accent"
        >
          {fabOpen ? <X className="size-5" /> : <Plus className="size-5" />}
        </button>

        <Link
          to="/ai"
          aria-label="AI murabbiy"
          className="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition hover:brightness-110"
        >
          <Sparkles className="size-6" />
        </Link>
      </div>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className={cn("size-5", active && "stroke-[2.5]")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <QuickAddDialog kind={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
