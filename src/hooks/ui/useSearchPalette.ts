import { useSyncExternalStore } from "react";

type Listener = () => void;
let open = false;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((listener) => listener());

/**
 * Open/closed state of the universal search (Ctrl+K), outside React so the
 * header button, the sidebar, the keyboard shortcut and the palette share it.
 */
export const searchPalette = {
  open() {
    if (open) return;
    open = true;
    emit();
  },
  close() {
    if (!open) return;
    open = false;
    emit();
  },
  set(value: boolean) {
    if (value) searchPalette.open();
    else searchPalette.close();
  },
  get: () => open,
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useSearchPaletteOpen(): boolean {
  return useSyncExternalStore(searchPalette.subscribe, searchPalette.get, searchPalette.get);
}
