import { ROUTES } from "@/constants/routes";

/**
 * Only same-app paths are valid post-login destinations; anything else
 * (absolute URLs, `//evil.com`) falls back to the dashboard.
 */
export function safeRedirect(target: string | null | undefined) {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return ROUTES.dashboard;
  }
  if (target.startsWith(ROUTES.login)) return ROUTES.dashboard;
  return target;
}

/** Login URL that brings the user back to `from` afterwards. */
export function loginUrlFor(from: string) {
  if (from === ROUTES.dashboard) return ROUTES.login;
  return `${ROUTES.login}?callbackUrl=${encodeURIComponent(from)}`;
}
