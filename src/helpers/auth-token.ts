import { STORAGE_KEYS } from "@/constants/storage-keys";
import { safeStorage } from "@/helpers/safe-storage";

type Listener = () => void;

const listeners = new Set<Listener>();
let current: string | null = safeStorage.get(STORAGE_KEYS.authToken);

function emit() {
  listeners.forEach((listener) => listener());
}

/**
 * Bearer token store. Lives outside React so the HTTP client can read it, and
 * exposes subscribe/getSnapshot for `useSyncExternalStore`.
 */
export const authToken = {
  get: () => current,
  set(token: string) {
    current = token;
    safeStorage.set(STORAGE_KEYS.authToken, token);
    emit();
  },
  clear() {
    if (current === null) return;
    current = null;
    safeStorage.remove(STORAGE_KEYS.authToken);
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
