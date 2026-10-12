/** The only app-shell service-worker registrar. Never cache editor previews. */
export async function registerOfflineShell() {
  if (!("serviceWorker" in navigator)) return;
  const host = window.location.hostname;
  const blocked = !import.meta.env.PROD || window.self !== window.top ||
    /^(id-preview--|preview--)/.test(host) ||
    ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"].some((zone) => host === zone || host.endsWith(`.${zone}`)) ||
    new URLSearchParams(window.location.search).get("sw") === "off";
  if (blocked) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.filter((registration) => {
      const worker = registration.active ?? registration.waiting ?? registration.installing;
      return worker && new URL(worker.scriptURL).pathname === "/sw.js";
    }).map((registration) => registration.unregister()));
    return;
  }
  await navigator.serviceWorker.register("/sw.js");
}