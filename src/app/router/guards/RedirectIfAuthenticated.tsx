import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { FullPageLoader } from "@/components/molecules/full-page-loader";
import { safeRedirect } from "@/helpers/safe-redirect";
import { useSession } from "@/hooks/auth/useSession";

/** Login pages: an already-signed-in user goes straight to the destination. */
export function RedirectIfAuthenticated() {
  const session = useSession();
  const [params] = useSearchParams();

  if (session.status === "loading") return <FullPageLoader />;
  if (session.status === "authenticated") {
    return <Navigate to={safeRedirect(params.get("callbackUrl"))} replace />;
  }
  return <Outlet />;
}
