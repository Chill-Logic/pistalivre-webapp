import { useSyncExternalStore } from "react";
import { installPrompt } from "@/helpers/pwa";

/** True while the browser offers its native install prompt. */
export function useInstallPrompt() {
  return useSyncExternalStore(
    installPrompt.subscribe,
    () => installPrompt.get() !== null,
  );
}
