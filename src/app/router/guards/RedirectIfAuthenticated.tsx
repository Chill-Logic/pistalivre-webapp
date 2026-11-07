import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { AppShellSkeleton } from "@/components/templates/app-shell-skeleton";
import { PortalShellSkeleton } from "@/components/templates/portal-shell-skeleton";
import { homeOf, realmOfKind, safeRedirect } from "@/helpers/safe-redirect";
import { useSession } from "@/hooks/auth/useSession";
import type { Realm } from "@/types/auth";

/**
 * Login pages: someone already signed in goes straight on — to the
 * callbackUrl when it is their own area, or to their area's home when they
 * opened the other area's login.
 */
export function RedirectIfAuthenticated({ realm }: { realm: Realm }) {
  const session = useSession();
  const [params] = useSearchParams();

  if (session.status === "loading") {
    return realm === "cliente" ? <PortalShellSkeleton /> : <AppShellSkeleton />;
  }
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
