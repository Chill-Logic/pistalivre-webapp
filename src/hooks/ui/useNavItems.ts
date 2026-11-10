import { isNavGroup, SIDEBAR_NAV, type NavEntry } from "@/constants/navigation";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

/**
 * The sidebar's entries this person may see: admin-only items hidden from
 * agents, and a group left empty by that goes too.
 */
export function useNavItems(): NavEntry[] {
  const { isAdmin } = useUserPermissions();
  return SIDEBAR_NAV.flatMap((entry): NavEntry[] => {
    if (!isNavGroup(entry)) return isAdmin || !entry.adminOnly ? [entry] : [];
    const items = entry.items.filter((item) => isAdmin || !item.adminOnly);
    return items.length ? [{ ...entry, items }] : [];
  });
}
