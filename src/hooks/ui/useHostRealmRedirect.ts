import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { hostRealm, urlOnRealmHost } from "@/helpers/host-realm";
import type { Realm } from "@/types/auth";

/**
 * A page of `realm` opened on the OTHER area's domain (an old link, a
 * bookmark) goes to the same address on its own domain. True while that
 * redirect happens, so the caller renders nothing.
 */
export function useHostRealmRedirect(realm: Realm) {
  const location = useLocation();
  const scoped = hostRealm();
  const wrongHost = scoped !== null && scoped !== realm;

  useEffect(() => {
    if (!wrongHost) return;
    window.location.replace(
      urlOnRealmHost(
        realm,
        location.pathname + location.search + location.hash,
      ),
    );
  }, [wrongHost, realm, location]);

  return wrongHost;
}
