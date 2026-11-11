import { useEffect, useSyncExternalStore } from "react";

/** How many editor docks are on screen (the floating assistant steps aside). */
let docks = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

const store = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => docks > 0,
};

/** An editor with its own assistant is on screen while this is mounted. */
export function useRegisterAiDock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    docks += 1;
    emit();
    return () => {
      docks -= 1;
      emit();
    };
  }, [active]);
}

/** Whether an editor's assistant is on screen (then the floating one hides). */
export function useAiDockPresent() {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
