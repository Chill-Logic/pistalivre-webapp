import { useMatch, useResolvedPath } from "react-router-dom";

/**
 * Whether `to` is the current route. NavLink's function `className` can't be
 * used under Radix `asChild` (Slot stringifies it), so the shell asks here.
 */
export function useIsActiveRoute(to: string, end = false) {
  const { pathname } = useResolvedPath(to);
  return useMatch({ path: pathname, end }) !== null;
}
