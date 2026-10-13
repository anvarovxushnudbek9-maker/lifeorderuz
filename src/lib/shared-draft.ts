export const SHARED_DRAFT_KEY = "life-order-shared-draft";
export function readSharedDraft(): { title: string; content: string } | null {
  try {
    const raw = sessionStorage.getItem(SHARED_DRAFT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as { title?: unknown; content?: unknown; createdAt?: unknown };
    if (typeof value.createdAt !== "number" || Date.now() - value.createdAt > 3600000) { sessionStorage.removeItem(SHARED_DRAFT_KEY); return null; }
    return { title: typeof value.title === "string" ? value.title.slice(0, 200) : "", content: typeof value.content === "string" ? value.content.slice(0, 5000) : "" };
  } catch { return null; }
}
export function saveSharedDraft(title: string, content: string) {
  sessionStorage.setItem(SHARED_DRAFT_KEY, JSON.stringify({ title: title.slice(0, 200), content: content.slice(0, 5000), createdAt: Date.now() }));
}