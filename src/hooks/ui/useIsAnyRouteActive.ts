import { matchPath, useLocation } from "react-router-dom";
import type { NavItem } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";

/** Whether the current page belongs to one of `items` (dashboard = exact). */
export function useIsAnyRouteActive(items: NavItem[]) {
  const { pathname } = useLocation();
  return items.some(
    (item) =>
      matchPath(
        { path: item.to, end: item.to === ROUTES.dashboard },
        pathname,
      ) !== null,
  );
}
