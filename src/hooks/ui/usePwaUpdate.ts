import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL = 60 * 60_000;
/** Time for the waiting worker to activate before reloading by hand. */
const RELOAD_FALLBACK_MS = 2_500;

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
      if (!registration) return;
      setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL);
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
