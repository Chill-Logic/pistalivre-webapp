import { SIDEBAR_NAV, type NavItem } from "@/constants/navigation";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

/** The sidebar's items this person may see (admin-only ones hidden from agents). */
export function useNavItems(): NavItem[] {
  const { isAdmin } = useUserPermissions();
  return SIDEBAR_NAV.filter((item) => isAdmin || !item.adminOnly);
}
