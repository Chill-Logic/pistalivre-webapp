import type { Realm } from "@/types/auth";

/**
 * Label of each area in the host name: app.gestao.<domain> (staff),
 * app.cliente.<domain> (customer portal) and app.parceiro.<domain>
 * (partners), with any environment prefix (dev.gestao…).
 */
export const REALM_HOST_LABEL: Record<Realm, string> = {
  gestao: "gestao",
  cliente: "cliente",
  parceiro: "parceiro",
};

const REALM_OF_LABEL: Record<string, Realm> = {
  [REALM_HOST_LABEL.gestao]: "gestao",
  [REALM_HOST_LABEL.cliente]: "cliente",
  [REALM_HOST_LABEL.parceiro]: "parceiro",
};

/**
 * The company's own domain (pistalivrelocacoes.com.br, with or without www):
 * there the app only shows the published landing. The backend answers the
 * rest of that domain (API, short links, webhooks).
 */
const LANDING_HOSTNAMES = ["pistalivrelocacoes.com.br", "www.pistalivrelocacoes.com.br"];

export function isLandingHostname(hostname: string): boolean {
  return LANDING_HOSTNAMES.includes(hostname.toLowerCase());
}

/** The area a host name is scoped to, or null when it serves all of them. */
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
