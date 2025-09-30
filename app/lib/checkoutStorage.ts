const KEY = "checkoutDraft:v1";

export function saveCheckoutDraft(draft: any, ttlMinutes = 60) {
  if (typeof window === "undefined") return;
  const payload = {
    v: 1,
    exp: Date.now() + ttlMinutes * 60 * 1000,
    data: draft,
  };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function loadCheckoutDraft() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.exp && parsed.exp < Date.now()) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed?.data ?? null;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

export function clearCheckoutDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
