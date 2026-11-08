import { Navigate, useLocation } from "react-router-dom";
import { AppShell } from "@/components/templates/app-shell";
import { AppShellSkeleton } from "@/components/templates/app-shell-skeleton";
import { PortalShell } from "@/components/templates/portal-shell";
import { PortalShellSkeleton } from "@/components/templates/portal-shell-skeleton";
import { homeOf, loginUrlFor, realmOfKind } from "@/helpers/safe-redirect";
import { useSession } from "@/hooks/auth/useSession";
import { useLabelCatalog } from "@/hooks/api/comum/labels/useLabelCatalog";
import { useHostRealmRedirect } from "@/hooks/ui/useHostRealmRedirect";
import type { Realm } from "@/types/auth";

/**
 * Private area of a realm: no session → that realm's login, keeping the deep
 * link as callbackUrl; a session of the OTHER realm → its own home (staff
 * never sees the portal and vice versa, like the Next middleware). Also holds
 * the shell until the label catalog arrives, so codes never flash on screen.
 * On a domain scoped to the other area, it goes to its own domain.
 */
export function RequireAuth({ realm }: { realm: Realm }) {
  const session = useSession();
  const labels = useLabelCatalog();
  const location = useLocation();
  const wrongHost = useHostRealmRedirect(realm);

  if (wrongHost) return null;
  if (session.status === "loading" || labels.isPending) {
    return realm === "cliente" ? <PortalShellSkeleton /> : <AppShellSkeleton />;
  }
  if (session.status === "anonymous") {
    return (
      <Navigate
        to={loginUrlFor(location.pathname + location.search, realm)}
        replace
      />
    );
  }
  const userRealm = realmOfKind(session.user.kind);
  if (userRealm !== realm) return <Navigate to={homeOf(userRealm)} replace />;
  return realm === "cliente" ? (
    <PortalShell user={session.user} />
  ) : (
    <AppShell user={session.user} />
  );
}
