import { ROUTES } from "@/constants/routes";
import type { AuthKind, Realm } from "@/types/auth";

const REALMS: Record<Realm, { home: string; login: string; kind: AuthKind }> = {
  gestao: { home: ROUTES.dashboard, login: ROUTES.login, kind: "user" },
  cliente: { home: ROUTES.portal, login: ROUTES.portalLogin, kind: "customer" },
  parceiro: {
    home: ROUTES.partnerArea,
    login: ROUTES.partnerAreaLogin,
    kind: "partner",
  },
};

export function homeOf(realm: Realm) {
  return REALMS[realm].home;
}

const REALM_OF_KIND: Record<AuthKind, Realm> = {
  user: "gestao",
  customer: "cliente",
  partner: "parceiro",
};

/**
 * The realm a token kind belongs to (staff → gestão, renter → portal,
 * partner → parceiro).
 */
export function realmOfKind(kind: AuthKind): Realm {
  return REALM_OF_KIND[kind] ?? "gestao";
}

function belongsTo(path: string, realm: Realm) {
  const home = homeOf(realm);
  // On the area's own domain its home is the root: every path is the area's.
  if (home === "/") return true;
  return (
    path === home || path.startsWith(`${home}/`) || path.startsWith(`${home}?`)
  );
}

/**
 * Only same-app paths inside the user's own area are valid post-login
 * destinations; anything else (absolute URLs, `//evil.com`, the other area,
 * the login itself) falls back to the area's home.
 */
export function safeRedirect(target: string | null | undefined, realm: Realm) {
  const { home, login } = REALMS[realm];
  if (!target || !target.startsWith("/") || target.startsWith("//"))
    return home;
  if (target.startsWith(login) || !belongsTo(target, realm)) return home;
  return target;
}

/** Login URL of the area, bringing the user back to `from` afterwards. */
export function loginUrlFor(from: string, realm: Realm) {
  const { home, login } = REALMS[realm];
  if (from === home) return login;
  return `${login}?callbackUrl=${encodeURIComponent(from)}`;
}
