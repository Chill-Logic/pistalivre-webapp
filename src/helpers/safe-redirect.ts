import { ROUTES } from "@/constants/routes";
import type { AuthKind, Realm } from "@/types/auth";

const REALMS: Record<Realm, { home: string; login: string; kind: AuthKind }> = {
  gestao: { home: ROUTES.dashboard, login: ROUTES.login, kind: "user" },
  cliente: { home: ROUTES.portal, login: ROUTES.portalLogin, kind: "customer" },
};

export function homeOf(realm: Realm) {
  return REALMS[realm].home;
}

/** The realm a token kind belongs to (staff → gestão, renter → portal). */
export function realmOfKind(kind: AuthKind): Realm {
  return kind === "customer" ? "cliente" : "gestao";
}

function belongsTo(path: string, realm: Realm) {
  const home = homeOf(realm);
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
