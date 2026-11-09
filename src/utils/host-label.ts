import type { Realm } from "@/types/auth";

/**
 * Label of each area in the host name: app.gestao.<domain> (staff) and
 * app.cliente.<domain> (customer portal), with any environment prefix
 * (dev.gestao…).
 */
export const REALM_HOST_LABEL: Record<Realm, string> = {
  gestao: "gestao",
  cliente: "cliente",
};

const REALM_OF_LABEL: Record<string, Realm> = {
  [REALM_HOST_LABEL.gestao]: "gestao",
  [REALM_HOST_LABEL.cliente]: "cliente",
};

/** The area a host name is scoped to, or null when it serves both. */
export function realmOfHostname(hostname: string): Realm | null {
  for (const label of hostname.split(".")) {
    const realm = REALM_OF_LABEL[label];
    if (realm) return realm;
  }
  return null;
}

/** Same host name with the area label swapped (keeps the environment prefix). */
export function hostnameForRealm(hostname: string, realm: Realm) {
  return hostname
    .split(".")
    .map((label) => (REALM_OF_LABEL[label] ? REALM_HOST_LABEL[realm] : label))
    .join(".");
}
