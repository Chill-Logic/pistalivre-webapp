import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";

const STANDALONE_MEDIA_QUERY = "(display-mode: standalone)";

/**
 * On a phone, in the browser (not the installed app): where the PWA invite
 * and the "Abrir no app" hint live. iPhone's `navigator.standalone` never
 * changes during a visit, so it is read once.
 */
export function useIsMobileBrowser() {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const isStandaloneDisplay = useMediaQuery(STANDALONE_MEDIA_QUERY);
  const isIosStandalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return !isDesktop && !isStandaloneDisplay && !isIosStandalone;
}
