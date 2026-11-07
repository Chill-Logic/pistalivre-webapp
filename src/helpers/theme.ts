import { STORAGE_KEYS } from "@/constants/storage-keys";
import { safeStorage } from "@/helpers/safe-storage";

export type Theme = "light" | "dark" | "system";

const THEMES: Theme[] = ["light", "dark", "system"];

export function readTheme(): Theme {
  const stored = safeStorage.get(STORAGE_KEYS.theme);
  return THEMES.includes(stored as Theme) ? (stored as Theme) : "system";
}

/** `system` sets no class: the prefers-color-scheme CSS takes over. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme !== "system") root.classList.add(theme);
  safeStorage.set(STORAGE_KEYS.theme, theme);
}

export function nextTheme(theme: Theme): Theme {
  return THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
}
