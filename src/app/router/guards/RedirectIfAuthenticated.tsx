import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { AppShellSkeleton } from "@/components/templates/app-shell-skeleton";
import { safeRedirect } from "@/helpers/safe-redirect";
import { useSession } from "@/hooks/auth/useSession";

/** Login pages: an already-signed-in user goes straight to the destination. */
export function RedirectIfAuthenticated() {
  const session = useSession();
  const [params] = useSearchParams();

  if (session.status === "loading") return <AppShellSkeleton />;
  if (session.status === "authenticated") {
    return <Navigate to={safeRedirect(params.get("callbackUrl"))} replace />;
  }
  return <Outlet />;
}
