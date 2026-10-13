import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { saveSharedDraft } from "@/lib/shared-draft";

export const Route = createFileRoute("/ulashish")({
  head: () => ({ meta: [
    { title: "Kundalikka ulashish — Life Order" },
    { name: "description", content: "Matn va fayllarni shaxsiy Life Order kundaligingizga qo‘shing." },
    { property: "og:title", content: "Kundalikka ulashish — Life Order" },
    { property: "og:description", content: "Ulashilgan matnni shaxsiy kundalikka saqlash." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }), component: SharePage,
});
function SharePage() {
  const { session, loading } = useAuth();
  const [status, setStatus] = React.useState("Ulashilgan matn tayyor.");
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const content = [params.get("text"), params.get("url"), params.get("q")?.replace(/^web\+lifeorder:\/*/, "")].filter(Boolean).join("\n");
    if (content || params.get("title")) saveSharedDraft(params.get("title") ?? "", content);
    window.history.replaceState(null, "", "/ulashish");
    const queue = (window as unknown as { launchQueue?: { setConsumer: (fn: (launch: { files: { getFile: () => Promise<File> }[] }) => void) => void } }).launchQueue;
    queue?.setConsumer(async (launch) => {
      try {
        const handle = launch.files[0];
        if (!handle) return;
        const file = await handle.getFile();
        if (file.size > 200000 || !/\.(txt|md)$/i.test(file.name)) { setStatus("Faqat 200 KB gacha bo‘lgan .txt yoki .md faylni tanlang."); return; }
        saveSharedDraft(file.name.replace(/\.(txt|md)$/i, ""), await file.text());
        setStatus("Fayl matni tayyor.");
      } catch { setStatus("Faylni o‘qib bo‘lmadi. Qayta oching."); }
    });
  }, []);
  return <main className="flex min-h-screen items-center justify-center px-5"><div className="max-w-md text-center">
    <FileText className="mx-auto size-10 text-primary" /><h1 className="mt-4 text-2xl font-semibold">Life Order · Kundalik</h1>
    <p className="my-4 text-muted-foreground">{status} Yozuv siz tasdiqlaganingizdan keyin saqlanadi.</p>
    <Button asChild disabled={loading}><Link to={session ? "/kundalik" : "/auth"} onClick={() => sessionStorage.setItem("life-order-after-auth", "/kundalik")}>{session ? "Kundalikni ochish" : "Kirish va davom etish"}</Link></Button>
  </div></main>;
}