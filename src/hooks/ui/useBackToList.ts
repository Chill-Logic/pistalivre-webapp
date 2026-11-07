import { useLocation } from "react-router-dom";

export type ListLocationState = { from?: string };

/**
 * Where "back" goes from a detail page: the list exactly as the user left it
 * (filters/page in the query string), or the bare list on a direct visit.
 */
export function useBackToList(fallback: string) {
  const location = useLocation();
  const state = location.state as ListLocationState | null;
  return state?.from ?? fallback;
}
