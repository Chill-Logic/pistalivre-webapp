import { REALM_PREFIX, routeTo } from "@/constants/routes";
import type { Realm } from "@/types/auth";
import { hostnameForRealm, realmOfHostname } from "@/utils/host-label";

/**
 * In production each area has its own domain, with an environment prefix:
 * app.gestao.<domain> (staff) and app.cliente.<domain> (customer portal),
 * one build and one deploy for both — and dev.gestao/dev.cliente work the
 * same way. Any host without one of those labels (localhost, the Vercel
 * address, previews) serves both areas, as in development. On an area's own
 * domain the paths have no area prefix (`constants/routes`).
 */

/** The area this host is scoped to, or null when it serves both. */
export function hostRealm(hostname = window.location.hostname): Realm | null {
  return realmOfHostname(hostname);
}

/**
 * `path` without the area's prefix (/area-cliente/locacoes/1 → /locacoes/1,
 * /gestao → /), as on that area's own domain. Other paths stay as they are.
 */
export function withoutRealmPrefix(realm: Realm, path: string) {
  const prefix = REALM_PREFIX[realm];
  if (!path.startsWith(prefix)) return path;
  const rest = path.slice(prefix.length);
  if (rest === "") return "/";
  if (rest.startsWith("/")) return rest;
  // "/gestao?x=1" → "/?x=1"; "/gestaoX" is not under the prefix.
  return /^[?#]/.test(rest) ? `/${rest}` : path;
}

/**
 * Same address on the other area's domain, keeping the environment prefix
 * (app.cliente.<domain> → app.gestao.<domain>). `path` is the prefixed one
 * (as this host builds it); on the area's own domain the prefix goes away.
 */
export function urlOnRealmHost(
  realm: Realm,
  path: string,
  location = window.location,
) {
  const host = hostnameForRealm(location.hostname, realm);
  const target =
    realmOfHostname(host) === realm ? withoutRealmPrefix(realm, path) : path;
  const port = location.port ? `:${location.port}` : "";
  return `${location.protocol}//${host}${port}${target}`;
}

/**
 * Link to the rental in the customer portal, on the customer area's domain
 * (app.gestao.… → app.cliente.…); a host that serves both areas
 * (localhost, the Vercel address) keeps its own origin.
 */
export function portalRentalUrl(rentalId: string, location = window.location) {
  return urlOnRealmHost("cliente", routeTo.portalRental(rentalId), location);
}
