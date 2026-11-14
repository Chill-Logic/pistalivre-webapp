import { HOST_REALM, REALM_PREFIX } from "@/constants/routes";

/**
 * A path the server wrote with the area prefix (/gestao/reembolsos) as this
 * host's route: on the area's own domain the prefix goes (app.gestao.…/reembolsos);
 * localhost and the Vercel address keep it.
 */
export function toAppPath(url: string): string {
  if (!HOST_REALM || !url.startsWith("/")) return url;
  const prefix = REALM_PREFIX[HOST_REALM];
  if (url === prefix) return "/";
  return url.startsWith(`${prefix}/`) ? url.slice(prefix.length) : url;
}
