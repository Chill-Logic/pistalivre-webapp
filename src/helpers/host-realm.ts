import type { Realm } from "@/types/auth";

/**
 * In production each area has its own domain: gestao.<domain> (staff) and
 * cliente.<domain> (customer portal), one build and one deploy for both.
 * Any other host (localhost, previews) serves both areas, as in development.
 */
const SUBDOMAIN: Record<Realm, string> = {
  gestao: "gestao",
  cliente: "cliente",
};

/** The area this host is scoped to, or null when it serves both. */
export function hostRealm(hostname = window.location.hostname): Realm | null {
  const first = hostname.split(".")[0];
  if (first === SUBDOMAIN.gestao) return "gestao";
  if (first === SUBDOMAIN.cliente) return "cliente";
  return null;
}

/** Same address on the other area's domain (https://cliente.<domain>/…). */
export function urlOnRealmHost(
  realm: Realm,
  path: string,
  location = window.location,
) {
  const [, ...rest] = location.hostname.split(".");
  const port = location.port ? `:${location.port}` : "";
  return `${location.protocol}//${SUBDOMAIN[realm]}.${rest.join(".")}${port}${path}`;
}
