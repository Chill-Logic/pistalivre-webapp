import { Navigate, useLocation } from "react-router-dom";
import { AppShellSkeleton } from "@/components/templates/app-shell-skeleton";
import { AppShell } from "@/components/templates/app-shell";
import { loginUrlFor } from "@/helpers/safe-redirect";
import { useSession } from "@/hooks/auth/useSession";

/** Private area: no session → login, keeping the deep link as callbackUrl. */
export function RequireAuth() {
  const session = useSession();
  const location = useLocation();

  if (session.status === "loading") return <AppShellSkeleton />;
  if (session.status === "anonymous") {
    return (
      <Navigate to={loginUrlFor(location.pathname + location.search)} replace />
    );
  }
  return <AppShell user={session.user} />;
}
