import { Navigate, useLocation, useParams } from "react-router-dom";

type LegacyRedirectProps = {
  /** New address, built from the old route's params. */
  to: (params: Readonly<Record<string, string | undefined>>) => string;
};

/** Old address (links already shared) → new one, keeping the query string. */
export function LegacyRedirect({ to }: LegacyRedirectProps) {
  const params = useParams();
  const { search } = useLocation();
  return <Navigate to={`${to(params)}${search}`} replace />;
}
