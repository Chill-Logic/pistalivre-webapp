import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Aside } from "@/components/atoms/landmarks";
import { Text } from "@/components/atoms/text";
import { Logo } from "@/components/molecules/logo";
import { SidebarNav } from "@/components/molecules/sidebar-nav";
import { SIDEBAR_WIDTH } from "@/constants/layout";
import { PARTNER_NAV_ITEMS } from "@/constants/partner-area";
import { ROUTES } from "@/constants/routes";

/**
 * Desktop (lg up) column of the partner area, like the staff's sidebar but
 * always open (four destinations). The phone keeps the simple header.
 */
export function PartnerAreaSidebar() {
  return (
    <Aside
      className="sticky top-0 z-40 hidden h-dvh shrink-0 flex-col border-r bg-card lg:flex"
      style={{ width: SIDEBAR_WIDTH.expanded }}
    >
      <Box className="flex h-14 shrink-0 items-center justify-center px-3">
        <Link to={ROUTES.partnerArea} aria-label="Início" className="rounded-md">
          <Logo size="xl" />
        </Link>
      </Box>
      <Box className="flex-1 overflow-y-auto overflow-x-hidden p-3">
        <SidebarNav items={PARTNER_NAV_ITEMS} />
      </Box>
      <Box className="border-t px-6 py-4">
        <Text size="xs" tone="muted">
          Área do parceiro
        </Text>
      </Box>
    </Aside>
  );
}
