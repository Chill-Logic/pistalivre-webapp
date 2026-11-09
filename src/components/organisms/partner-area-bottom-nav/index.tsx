import { Box } from "@/components/atoms/box";
import { Nav } from "@/components/atoms/landmarks";
import { NavLink } from "@/components/molecules/nav-link";
import { PARTNER_NAV_ITEMS } from "@/constants/partner-area";
import { useSidebar } from "@/hooks/ui/useSidebar";

/**
 * Phone navigation of the partner area, at the thumb's reach like the staff's
 * and the customer's: its four destinations (no "Menu" needed). Unmounted on
 * the desktop, where the sidebar takes over.
 */
export function PartnerAreaBottomNav() {
  const { isDesktop } = useSidebar();
  if (isDesktop) return null;

  return (
    <Nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-safe-b backdrop-blur supports-[backdrop-filter]:bg-card/85"
    >
      <Box className="flex">
        {PARTNER_NAV_ITEMS.map((item) => (
          <NavLink key={item.to} item={item} layout="bar" />
        ))}
      </Box>
    </Nav>
  );
}
