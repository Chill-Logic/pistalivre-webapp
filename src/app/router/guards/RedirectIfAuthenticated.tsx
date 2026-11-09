import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { RealmShellSkeleton } from "./RequireAuth";
import { homeOf, realmOfKind, safeRedirect } from "@/helpers/safe-redirect";
import { useSession } from "@/hooks/auth/useSession";
import { useHostRealmRedirect } from "@/hooks/ui/useHostRealmRedirect";
import type { Realm } from "@/types/auth";

/**
 * Login pages: someone already signed in goes straight on — to the
 * callbackUrl when it is their own area, or to their area's home when they
 * opened another area's login. On a domain scoped to another area, it goes
 * to its own domain.
 */
export function RedirectIfAuthenticated({ realm }: { realm: Realm }) {
  const session = useSession();
  const [params] = useSearchParams();
  const wrongHost = useHostRealmRedirect(realm);

  if (wrongHost) return null;
  if (session.status === "loading") return <RealmShellSkeleton realm={realm} />;
  if (session.status === "authenticated") {
    const userRealm = realmOfKind(session.user.kind);
    const target =
      userRealm === realm
        ? safeRedirect(params.get("callbackUrl"), realm)
        : homeOf(userRealm);
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
