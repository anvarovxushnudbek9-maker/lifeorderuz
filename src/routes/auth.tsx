import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck, Sparkles, Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Reveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

const TITLE = "Kirish — Life Order";
const DESC = "Life Order hisobingizga kiring yoki bir daqiqada ro'yxatdan o'ting.";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.28a12 12 0 0 0 0 10.74l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.95 1.18 15.24 0 12 0A12 12 0 0 0 1.28 6.63l4.01 3.09C6.23 6.86 8.88 4.75 12 4.75Z"
      />
    </svg>
  );
}

function scorePassword(p: string) {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
}

const STRENGTH = [
  { label: "Juda zaif", color: "bg-destructive" },
  { label: "Zaif", color: "bg-destructive" },
  { label: "O'rtacha", color: "bg-amber-500" },
  { label: "Yaxshi", color: "bg-emerald-500" },
  { label: "Kuchli", color: "bg-emerald-600" },
] as const;

function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);
  const info = STRENGTH[score]!;
  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-500",
              i < score ? info.color : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Parol kuchi: <span className="font-medium text-foreground">{info.label}</span>
      </p>
    </div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = React.useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [googleBusy, setGoogleBusy] = React.useState(false);

  React.useEffect(() => {
    if (session) navigate({ to: "/dashboard", replace: true });
  }, [session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/onboarding", replace: true });
        } else {
          toast.success("Hisob yaratildi. Pochtangizni tasdiqlang.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setGoogleBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google orqali kirishda xatolik");
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/dashboard", replace: true });
    } catch {
      toast.error("Google orqali kirishda xatolik");
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-[-10rem] size-[34rem] rounded-full bg-primary/15 blur-3xl"
      />

      {/* Brand side */}
      <aside className="relative hidden w-1/2 flex-col justify-between border-r border-border bg-secondary/40 p-10 lg:flex">
        <Link to="/" className="text-sm font-bold tracking-[0.2em]">
          Life Order
        </Link>
        <Reveal>
          <h2 className="max-w-sm text-4xl font-bold leading-tight tracking-tight">
            Motivatsiya tugaydi.
            <br />
            <span className="text-gradient">Tizim qoladi.</span>
          </h2>
          <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
            {[
              { icon: Flame, t: "Odatlar, streaklar va kunlik tizim" },
              { icon: Sparkles, t: "Raqamlaringizni ko'radigan AI murabbiy" },
              { icon: ShieldCheck, t: "Ma'lumotlaringiz faqat sizniki" },
            ].map((r) => (
              <li key={r.t} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                  <r.icon className="size-4 text-primary" />
                </span>
                {r.t}
              </li>
            ))}
          </ul>
        </Reveal>
        <p className="text-xs text-muted-foreground">Shaxsiy rivojlanish ekosistemasi</p>
      </aside>

      {/* Form side */}
      <main className="flex w-full flex-col items-center justify-center px-5 py-10 lg:w-1/2">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:self-start"
        >
          <ArrowLeft className="size-4" /> Bosh sahifa
        </Link>

        <Reveal className="w-full max-w-sm">
          <div className="w-full rounded-3xl border border-border bg-card p-6 shadow-elegant">
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-sm">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-lg py-2 font-medium transition-all duration-300",
                    mode === m
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "signin" ? "Kirish" : "Ro'yxatdan o'tish"}
                </button>
              ))}
            </div>

            <h1 className="text-xl font-bold text-card-foreground">
              {mode === "signin" ? "Xush kelibsiz" : "Hisob yaratish"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Tizimingizni davom ettiring."
                : "Bir daqiqada boshlang — bepul."}
            </p>

            <Button
              variant="outline"
              className="mt-5 w-full gap-2"
              onClick={google}
              disabled={googleBusy}
            >
              {googleBusy ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
              Google bilan davom etish
            </Button>

            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> yoki <span className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-4" onSubmit={submit}>
              <div
                className={cn(
                  "grid overflow-hidden transition-all duration-300",
                  mode === "signup" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="min-h-0 space-y-1.5">
                  <Label htmlFor="name">Ism</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={mode === "signup"}
                    placeholder="Ismingiz"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="siz@pochta.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Parol</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    minLength={6}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    aria-label="Parolni ko'rsatish"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {mode === "signup" && (
                  <p className="text-xs text-muted-foreground">Kamida 6 ta belgi.</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : mode === "signin" ? (
                  "Kirish"
                ) : (
                  "Ro'yxatdan o'tish"
                )}
              </Button>
            </form>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
