import { matchPath, useLocation } from "react-router-dom";
import type { SectionTab } from "@/components/molecules/section-tabs";

/**
 * Index of the tab the current URL is on (-1 = none). Tabs match their exact
 * path, so a detail under a tab (e.g. /financeiro/debitos/:id) is not a tab.
 */
export function useActiveTabIndex(tabs: SectionTab[]) {
  const { pathname } = useLocation();
  return tabs.findIndex(
    (tab) => matchPath({ path: tab.to, end: true }, pathname) !== null,
  );
}
