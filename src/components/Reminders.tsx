import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, BellRing, Check, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { useReminders } from "@/hooks/useReminders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { appliesOn, hhmm, isDone, localISO, REPEAT_LABEL } from "@/lib/reminders";

const schema = z
  .object({
    title: z.string().trim().min(1, "Nomini yozing").max(200),
    remind_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, "Boshlanish vaqtini kiriting"),
    end_time: z.string().regex(/^\d{2}:\d{2}$/).or(z.literal("")),
    repeat: z.enum(["none", "daily", "weekdays"]),
  })
  .refine((v) => !v.end_time || v.end_time > v.start_time, {
    message: "Tugash vaqti boshlanishdan keyin bo'lsin",
  });

/** Today's reminders with done toggles — used on the dashboard. */
export function TodayReminders() {
  const { reminders, toggleDone } = useReminders();
  const today = reminders.filter((r) => appliesOn(r));
  const done = today.filter((r) => isDone(r)).length;
  const pct = today.length ? Math.round((done / today.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <BellRing className="size-4 text-primary" /> Bugungi eslatmalar
        </h2>
        <span className="text-sm text-muted-foreground">
          {done}/{today.length} bajarildi
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      {today.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Bugun eslatma yo'q. Kundalik sahifasida vaqt bilan reja qo'shing.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {today.map((r) => (
            <ReminderRow key={r.id} r={r} onToggle={() => toggleDone.mutate(r)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ReminderRow({
  r,
  onToggle,
  onDelete,
}: {
  r: Parameters<typeof isDone>[0];
  onToggle: () => void;
  onDelete?: () => void;
}) {
  const done = isDone(r);
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
      <button
        type="button"
        onClick={onToggle}
        aria-label={done ? "Bajarilmagan deb belgilash" : "Bajarildi deb belgilash"}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          done ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary",
        )}
      >
        {done && <Check className="size-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", done && "text-muted-foreground line-through")}>
          {r.title}
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {hhmm(r.start_time)}
          {r.end_time ? `–${hhmm(r.end_time)}` : ""} · {REPEAT_LABEL[r.repeat] ?? r.repeat}
        </p>
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="O'chirish"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </li>
  );
}

/** Full manager — used on the journal page. */
export function RemindersManager() {
  const { reminders, toggleDone, remove, uid, key } = useReminders();
  const qc = useQueryClient();
  const [form, setForm] = React.useState({
    title: "",
    remind_date: localISO(),
    start_time: "",
    end_time: "",
    repeat: "none" as "none" | "daily" | "weekdays",
  });
  const [perm, setPerm] = React.useState<string>("default");
  React.useEffect(() => {
    if (typeof Notification !== "undefined") setPerm(Notification.permission);
  }, []);

  const add = useMutation({
    mutationFn: async () => {
      const v = schema.parse(form);
      const { error } = await supabase.from("reminders").insert({
        user_id: uid,
        title: v.title,
        remind_date: v.remind_date,
        start_time: v.start_time,
        end_time: v.end_time || null,
        repeat: v.repeat,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm((f) => ({ ...f, title: "", start_time: "", end_time: "" }));
      qc.invalidateQueries({ queryKey: key });
      toast.success("Eslatma qo'shildi");
    },
    onError: (e) =>
      toast.error(e instanceof z.ZodError ? (e.issues[0]?.message ?? "Xato") : (e as Error).message),
  });

  async function askPermission() {
    if (typeof Notification === "undefined") return toast.error("Brauzeringiz bildirishnomani qo'llamaydi");
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === "granted") toast.success("Bildirishnomalar yoqildi");
  }

  const upcoming = reminders.filter((r) => r.repeat !== "none" || r.remind_date >= localISO());

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Bell className="size-4 text-primary" /> Vaqtli eslatmalar
        </h2>
        {perm !== "granted" && (
          <Button size="sm" variant="outline" onClick={askPermission}>
            Bildirishnomani yoqish
          </Button>
        )}
      </div>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-6"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <Input
          className="sm:col-span-6"
          placeholder="Masalan: Ertalabki mashq"
          maxLength={200}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <label className="text-xs text-muted-foreground sm:col-span-2">
          Sana
          <Input type="date" value={form.remind_date} onChange={(e) => setForm({ ...form, remind_date: e.target.value })} />
        </label>
        <label className="text-xs text-muted-foreground sm:col-span-1">
          Boshlanish
          <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
        </label>
        <label className="text-xs text-muted-foreground sm:col-span-1">
          Tugash
          <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
        </label>
        <label className="text-xs text-muted-foreground sm:col-span-2">
          Takrorlash
          <select
            className="mt-0 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
            value={form.repeat}
            onChange={(e) => setForm({ ...form, repeat: e.target.value as typeof form.repeat })}
          >
            <option value="none">Bir marta</option>
            <option value="daily">Har kuni</option>
            <option value="weekdays">Ish kunlari</option>
          </select>
        </label>
        <Button type="submit" className="sm:col-span-6" disabled={add.isPending}>
          Eslatma qo'shish
        </Button>
      </form>
      <ul className="mt-5 space-y-2">
        {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Hali eslatma yo'q.</p>}
        {upcoming.map((r) => (
          <ReminderRow key={r.id} r={r} onToggle={() => toggleDone.mutate(r)} onDelete={() => remove.mutate(r.id)} />
        ))}
      </ul>
    </section>
  );
}

/** Background watcher: fires an in-app toast (and browser notification if allowed) at start/end time. */
export function ReminderWatcher() {
  const { reminders } = useReminders();
  const fired = React.useRef(new Set<string>());

  React.useEffect(() => {
    function check() {
      const now = new Date();
      const cur = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const day = localISO(now);
      for (const r of reminders) {
        if (!appliesOn(r, now) || isDone(r, now)) continue;
        const events: [string, string][] = [[hhmm(r.start_time), "boshlanish vaqti"]];
        if (r.end_time) events.push([hhmm(r.end_time), "tugash vaqti"]);
        for (const [t, label] of events) {
          const id = `${r.id}-${day}-${t}`;
          if (t !== cur || fired.current.has(id)) continue;
          fired.current.add(id);
          toast(`⏰ ${r.title}`, { description: `${t} — ${label}`, duration: 15000 });
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            try {
              new Notification(`Life Order: ${r.title}`, { body: `${t} — ${label}` });
            } catch {
              /* some mobile browsers disallow direct notifications */
            }
          }
        }
      }
    }
    check();
    const id = window.setInterval(check, 20000);
    return () => window.clearInterval(id);
  }, [reminders]);

  return null;
}
