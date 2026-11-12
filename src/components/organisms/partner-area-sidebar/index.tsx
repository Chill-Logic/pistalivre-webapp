import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Aside } from "@/components/atoms/landmarks";
import { Credits } from "@/components/molecules/credits";
import { Logo } from "@/components/molecules/logo";
import { SidebarCollapseToggle } from "@/components/molecules/sidebar-collapse-toggle";
import { SidebarNav } from "@/components/molecules/sidebar-nav";
import { SIDEBAR_WIDTH } from "@/constants/layout";
import { PARTNER_NAV_ITEMS } from "@/constants/partner-area";
import { ROUTES } from "@/constants/routes";
import { useSidebar } from "@/hooks/ui/useSidebar";

/**
 * Desktop column of the partner area, like the staff's: collapses to icons
 * with the round button on its edge. The phone uses the bottom bar.
 */
export function PartnerAreaSidebar() {
  const { isDesktop, isCollapsed } = useSidebar();
  if (!isDesktop) return null;

  return (
    <Aside
      className="sticky top-0 z-40 flex h-dvh shrink-0 flex-col border-r bg-card transition-[width] duration-300 ease-in-out motion-reduce:transition-none"
      style={{
        width: isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
      }}
    >
      <Box className="flex h-14 shrink-0 items-center justify-center px-3">
        <Link
          to={ROUTES.partnerArea}
          aria-label="Início"
          className="rounded-md"
        >
          <Logo size={isCollapsed ? "sm" : "xl"} />
        </Link>
      </Box>
      <Box className="scrollbar-quiet flex-1 overflow-y-auto overflow-x-hidden p-3">
        <SidebarNav items={PARTNER_NAV_ITEMS} collapsed={isCollapsed} />
      </Box>
      {!isCollapsed && <Credits className="shrink-0 border-t px-4 py-3" />}
      <SidebarCollapseToggle />
    </Aside>
  );
}
