import { useState } from "react";
import { safeStorage } from "@/helpers/safe-storage";

/**
 * Open/closed that survives navigation and reloads (per viewer, in this
 * browser). Without a key it is plain state.
 */
export function useRememberedToggle(
  storageKey: string | undefined,
  initial: boolean,
) {
  const key = storageKey ? `pl:open:${storageKey}` : null;
  const [open, setOpen] = useState(() => {
    const saved = key ? safeStorage.get(key) : null;
    return saved === null ? initial : saved === "1";
  });
  const toggle = () =>
    setOpen((current) => {
      if (key) safeStorage.set(key, current ? "0" : "1");
      return !current;
    });
  return [open, toggle] as const;
}
