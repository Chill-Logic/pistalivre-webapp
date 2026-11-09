import type { PwaUsage } from "@/types/auth";
import { formatDate, formatRelativeTime } from "@/utils/format";

/** PWA columns of a customer/staff user, as the staff API sends them. */
export type PwaUsageFields = {
  pwaFirstUsedAt?: string | null;
  pwaLastUsedAt?: string | null;
  pwaInstalledAt?: string | null;
};

/** "Agora não" hides the invite for this long. */
export const PWA_INVITE_SNOOZE_DAYS = 7;

/** Chrome's install prompt (not in the DOM typings). */
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** How to install where the browser offers no native prompt. */
export type InstallGuide = "ios" | "ios-other-browser" | "manual";

/** Opened from the home-screen icon (Android/desktop, or iPhone's flag). */
export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function installGuide(userAgent = navigator.userAgent): InstallGuide {
  const isIos =
    /iphone|ipad|ipod/i.test(userAgent) ||
    // iPadOS reports itself as a Mac.
    (/macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1);
  if (!isIos) return "manual";
  const otherBrowser = /crios|fxios|edgios/i.test(userAgent);
  return otherBrowser ? "ios-other-browser" : "ios";
}

/**
 * Invite only who never opened the app nor clicked "Instalar", and not within
 * the snooze after "Agora não". No `pwa` (older API) = don't invite.
 */
export function shouldInviteToPwa(pwa: PwaUsage | undefined, now = Date.now()) {
  if (!pwa || pwa.firstUsedAt || pwa.installedAt) return false;
  if (!pwa.inviteDismissedAt) return true;
  const snoozeMs = PWA_INVITE_SNOOZE_DAYS * 86_400_000;
  return now - new Date(pwa.inviteDismissedAt).getTime() > snoozeMs;
}

/** Already opened the app or clicked "Instalar": offer "Abrir no app". */
export function hasPwa(pwa: PwaUsage | undefined) {
  return Boolean(pwa && (pwa.firstUsedAt || pwa.installedAt));
}

export function isAndroid(userAgent = navigator.userAgent) {
  return /android/i.test(userAgent);
}

/**
 * Staff view of someone's app usage. null = the API didn't send it (older
 * backend): show nothing rather than a wrong "Só pelo navegador".
 */
export function pwaUsageText(fields: PwaUsageFields) {
  if (fields.pwaFirstUsedAt === undefined) return null;
  if (fields.pwaFirstUsedAt) {
    const since = `Usa o app desde ${formatDate(fields.pwaFirstUsedAt)}`;
    return fields.pwaLastUsedAt
      ? `${since} · último uso ${formatRelativeTime(fields.pwaLastUsedAt)}`
      : since;
  }
  if (fields.pwaInstalledAt) {
    return `Baixou o app em ${formatDate(fields.pwaInstalledAt)} (ainda não abriu por ele)`;
  }
  return "Só pelo navegador";
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/**
 * The browser fires `beforeinstallprompt` once, early: catch it at startup
 * (main.tsx) so the invite can open the native prompt later.
 */
export function listenInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

export const installPrompt = {
  get: () => deferredPrompt,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** Opens the native prompt; true when the person accepted. */
  async open() {
    const event = deferredPrompt;
    if (!event) return false;
    await event.prompt();
    const { outcome } = await event.userChoice;
    deferredPrompt = null;
    notify();
    return outcome === "accepted";
  },
};
