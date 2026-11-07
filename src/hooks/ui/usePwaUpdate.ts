import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL = 60 * 60_000;

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
    update: () => updateServiceWorker(true),
    dismiss: () => setNeedRefresh(false),
  };
}
