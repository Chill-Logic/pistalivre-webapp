import { matchPath, useLocation } from "react-router-dom";
import type { NavItem } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";

/** The item of `items` the current page belongs to (same rules as NavLink). */
export function useActiveNavItem(items: NavItem[]) {
  const { pathname } = useLocation();
  return items.find(
    (item) =>
      matchPath(
        { path: item.to, end: item.exact || item.to === ROUTES.dashboard },
        pathname,
      ) !== null &&
      !(item.except ?? []).some((path) =>
        matchPath({ path, end: false }, pathname),
      ),
  );
}
