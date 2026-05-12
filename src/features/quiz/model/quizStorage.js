// Centralized Quiz storage + tracking
// Hard constraints:
// - DO NOT change key name ("lv_quiz")
// - DO NOT change data shape (only patch merge + updatedAt like before)

const STORAGE_KEY = "lv_quiz";
const LEGACY_KEYS = ["lipvariety_quiz_v1"];

export function loadQuiz() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);

    // migrate from legacy keys on first access
    for (const k of LEGACY_KEYS) {
      const legacy = localStorage.getItem(k);
      if (legacy) {
        localStorage.setItem(STORAGE_KEY, legacy);
        LEGACY_KEYS.forEach((lk) => { try { localStorage.removeItem(lk); } catch {} });
        return JSON.parse(legacy);
      }
    }
    return {};
  } catch {
    return {};
  }
}

export function patchQuiz(partial) {
  const prev = loadQuiz();
  const next = { ...prev, ...partial, updatedAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function resetQuiz() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_KEYS.forEach((k) => { try { localStorage.removeItem(k); } catch {} });
  } catch {}
}

export function track(event, payload = {}) {
  try {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
  } catch {}
}
