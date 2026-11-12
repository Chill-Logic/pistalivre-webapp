import { useState } from "react";
import { readToggle, saveToggle, type UiStore } from "@/helpers/ui-state";

/**
 * Open/closed that survives navigation and reloads (per viewer, in this
 * browser), kept in the JSON of its store (helpers/ui-state). Without a
 * name it is plain state.
 */
export function useRememberedToggle(
  store: UiStore,
  name: string | undefined,
  initial: boolean,
) {
  const [open, setOpen] = useState(() =>
    name ? (readToggle(store, name) ?? initial) : initial,
  );
  const set = (value: boolean) => {
    if (name) saveToggle(store, name, value);
    setOpen(value);
  };
  const toggle = () => set(!open);
  return [open, toggle, set] as const;
}
