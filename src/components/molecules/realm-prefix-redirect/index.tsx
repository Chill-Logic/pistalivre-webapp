import { Navigate, useLocation } from "react-router-dom";
import { withoutRealmPrefix } from "@/helpers/host-realm";
import { useHostRealmRedirect } from "@/hooks/ui/useHostRealmRedirect";
import type { Realm } from "@/types/auth";

/**
 * On an area's own domain, an address with an area prefix (links shared
 * before the clean paths): this area's prefix is dropped
 * (app.gestao.…/gestao/locacoes → /locacoes); the other area's goes to that
 * area's domain (app.gestao.…/area-cliente/… → app.cliente.…/…). Keeps the
 * query string and the hash.
 */
export function RealmPrefixRedirect({ realm }: { realm: Realm }) {
  const { pathname, search, hash } = useLocation();
  const otherArea = useHostRealmRedirect(realm);

  if (otherArea) return null;
  return (
    <Navigate
      to={`${withoutRealmPrefix(realm, pathname)}${search}${hash}`}
      replace
    />
  );
}
