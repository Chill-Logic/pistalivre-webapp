import { useRegisterSW } from "virtual:pwa-register/react";
import { router } from "@/app/router";

/** Periodic check while the app stays open. */
const UPDATE_CHECK_INTERVAL = 5 * 60_000;
/** Navigations in a row (or focus + navigation) check once. */
const MIN_CHECK_GAP_MS = 30_000;
/** Time for the waiting worker to activate before reloading by hand. */
const RELOAD_FALLBACK_MS = 2_500;

/**
 * Looks for a new version on load/reload, on every navigation, when the app
 * comes back to the screen (switching back to it on the phone) and every 5
 * minutes — at most once every 30 s, and never offline.
 */
function watchForUpdates(registration: ServiceWorkerRegistration) {
  let last = 0;
  const check = () => {
    if (navigator.onLine === false) return;
    const now = Date.now();
    if (now - last < MIN_CHECK_GAP_MS) return;
    last = now;
    registration.update().catch(() => undefined);
  };
  check();
  setInterval(check, UPDATE_CHECK_INTERVAL);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });
  window.addEventListener("focus", check);
  router.subscribe((state) => {
    if (state.navigation.state === "idle") check();
  });
}

/**
 * Service worker lifecycle. `registerType: "prompt"` means a new version waits
 * until the user accepts, so an open form is never reloaded under them.
 */
export function usePwaUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) watchForUpdates(registration);
    },
  });

  return {
    needRefresh,
    update: async () => {
      // The plugin reloads when the new worker takes control of this page. A
      // page it never controlled (opened with Ctrl+F5, the first visit) gets
      // no such event and the button did nothing: reload anyway, once the
      // worker had time to activate, so the next load is the new version.
      setTimeout(() => window.location.reload(), RELOAD_FALLBACK_MS);
      await updateServiceWorker(true);
    },
    dismiss: () => setNeedRefresh(false),
  };
}
