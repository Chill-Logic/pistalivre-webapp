import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/** Browser connectivity; drives the offline banner of the PWA. */
export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, () => navigator.onLine);
}
