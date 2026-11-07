import { Navigate, useLocation } from "react-router-dom";
import { AppShellSkeleton } from "@/components/templates/app-shell-skeleton";
import { AppShell } from "@/components/templates/app-shell";
import { loginUrlFor } from "@/helpers/safe-redirect";
import { useSession } from "@/hooks/auth/useSession";
import { useLabelCatalog } from "@/hooks/api/comum/labels/useLabelCatalog";

/**
 * Private area: no session → login, keeping the deep link as callbackUrl.
 * Also holds the shell until the label catalog arrives, so screens never
 * flash English codes. If it fails, screens fall back to the codes.
 */
export function RequireAuth() {
  const session = useSession();
  const labels = useLabelCatalog();
  const location = useLocation();

  if (session.status === "loading" || labels.isPending) {
    return <AppShellSkeleton />;
  }
  if (session.status === "anonymous") {
    return (
      <Navigate to={loginUrlFor(location.pathname + location.search)} replace />
    );
  }
  return <AppShell user={session.user} />;
}
