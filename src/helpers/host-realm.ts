import type { Realm } from "@/types/auth";

/**
 * In production each area has its own domain, with an environment prefix:
 * app.gestao.<domain> (staff) and app.cliente.<domain> (customer portal),
 * one build and one deploy for both — and dev.gestao/dev.cliente work the
 * same way. Any host without one of those labels (localhost, the Vercel
 * address, previews) serves both areas, as in development.
 */
const LABEL: Record<Realm, string> = {
  gestao: "gestao",
  cliente: "cliente",
};

const REALM_OF_LABEL: Record<string, Realm> = {
  [LABEL.gestao]: "gestao",
  [LABEL.cliente]: "cliente",
};

/** The area this host is scoped to, or null when it serves both. */
export function hostRealm(hostname = window.location.hostname): Realm | null {
  for (const label of hostname.split(".")) {
    const realm = REALM_OF_LABEL[label];
    if (realm) return realm;
  }
  return null;
}

/**
 * Same address on the other area's domain, keeping the environment prefix
 * (app.cliente.<domain> → app.gestao.<domain>).
 */
export function urlOnRealmHost(
  realm: Realm,
  path: string,
  location = window.location,
) {
  const host = location.hostname
    .split(".")
    .map((label) => (REALM_OF_LABEL[label] ? LABEL[realm] : label))
    .join(".");
  const port = location.port ? `:${location.port}` : "";
  return `${location.protocol}//${host}${port}${path}`;
}
