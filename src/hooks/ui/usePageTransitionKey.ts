import { useLocation } from "react-router-dom";
import { FINANCE_TABS } from "@/constants/finance";
import { INTEGRATION_TABS } from "@/constants/integrations";
import { MODEL_TABS } from "@/constants/models";

const TABBED_SECTIONS = [MODEL_TABS, FINANCE_TABS, INTEGRATION_TABS];

/**
 * Key of the page enter animation: the path, except that all tabs of a
 * section share one key, so switching tabs doesn't replay the whole page
 * (the section slides only its content).
 */
export function usePageTransitionKey() {
  const { pathname } = useLocation();
  const section = TABBED_SECTIONS.find((tabs) =>
    tabs.some((tab) => tab.to === pathname),
  );
  return section ? section[0].to : pathname;
}
