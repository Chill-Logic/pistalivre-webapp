import { isStandalone } from "@/helpers/pwa";
import type { PushSubscriptionInput } from "@/types/notification";

/** Why push can't be turned on in this browser (null = it can). */
export type PushBlocker = "unsupported" | "ios-not-installed" | "denied" | null;

const isIos = (userAgent = navigator.userAgent) =>
  /iphone|ipad|ipod/i.test(userAgent) ||
  (userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);

/**
 * On the iPhone, push exists only for the app installed on the home screen
 * (iOS 16.4+); in Safari's tab the API is simply missing.
 */
export function pushBlocker(): PushBlocker {
  const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (!supported) return isIos() && !isStandalone() ? "ios-not-installed" : "unsupported";
  if (Notification.permission === "denied") return "denied";
  return null;
}

/** The service worker (registered by the PWA plugin); null in dev without it. */
async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  return (await navigator.serviceWorker.getRegistration()) ?? null;
}

export async function currentPushSubscription(): Promise<PushSubscription | null> {
  const reg = await registration();
  return reg ? reg.pushManager.getSubscription() : null;
}

/** The VAPID key travels as base64url; the browser wants the raw bytes. */
function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/**
 * Asks the permission (only ever from a click) and subscribes this browser.
 * Returns what the server stores, or throws a message the person understands.
 */
export async function subscribeToPush(publicKey: string): Promise<PushSubscriptionInput> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("O navegador não liberou as notificações. Libere nas configurações do site e tente de novo.");
  }
  const reg = await registration();
  if (!reg) throw new Error("Abra o sistema pelo app instalado (ou recarregue a página) para ativar o push.");
  const existing = await reg.pushManager.getSubscription();
  const subscription =
    existing ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) }));
  const json = subscription.toJSON();
  return {
    endpoint: subscription.endpoint,
    keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
  };
}

/** Stops push on this browser; returns the endpoint the server should forget. */
export async function unsubscribeFromPush(): Promise<string | null> {
  const subscription = await currentPushSubscription();
  if (!subscription) return null;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}
