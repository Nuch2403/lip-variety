import type { QuizState } from "@/types/index";

const STORAGE_KEY = "lv_quiz";
const LEGACY_KEYS = ["lipvariety_quiz_v1"];

export function loadQuiz(): QuizState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as QuizState;

    for (const k of LEGACY_KEYS) {
      const legacy = localStorage.getItem(k);
      if (legacy) {
        localStorage.setItem(STORAGE_KEY, legacy);
        LEGACY_KEYS.forEach((lk) => { try { localStorage.removeItem(lk); } catch {} });
        return JSON.parse(legacy) as QuizState;
      }
    }
    return {};
  } catch {
    return {};
  }
}

export function patchQuiz(partial: Partial<QuizState>): QuizState {
  const prev = loadQuiz();
  const next: QuizState = { ...prev, ...partial, updatedAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function resetQuiz(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_KEYS.forEach((k) => { try { localStorage.removeItem(k); } catch {} });
  } catch {}
}

export function track(event: string, payload: Record<string, unknown> = {}): void {
  try {
    if (typeof window === "undefined") return;
    const win = window as typeof window & { dataLayer?: unknown[] };
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push({ event, ...payload });
  } catch {}
}
