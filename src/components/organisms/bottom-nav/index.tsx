import { Box } from "@/components/atoms/box";
import { Nav } from "@/components/atoms/landmarks";
import { BottomNavMenuButton } from "@/components/molecules/bottom-nav-menu-button";
import { NavLink } from "@/components/molecules/nav-link";
import { NavSheet } from "@/components/organisms/nav-sheet";
import { MAIN_NAV } from "@/constants/navigation";
import { useIsAnyRouteActive } from "@/hooks/ui/useIsAnyRouteActive";
import { useSidebar } from "@/hooks/ui/useSidebar";
import type { AuthUser } from "@/types/auth";

type BottomNavProps = {
  user: AuthUser;
};

/**
 * Mobile navigation at the thumb's reach: the daily destinations plus "Menu",
 * which opens everything else in a bottom sheet. Unmounted from `md` up.
 */
export function BottomNav({ user }: BottomNavProps) {
  const { isDesktop, isDrawerOpen, setDrawerOpen } = useSidebar();
  const onMainDestination = useIsAnyRouteActive(MAIN_NAV);
  if (isDesktop) return null;

  return (
    <Nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-safe-b backdrop-blur supports-[backdrop-filter]:bg-card/85"
    >
      <Box className="flex">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.to} item={item} layout="bar" />
        ))}
        <BottomNavMenuButton
          isActive={!onMainDestination}
          isOpen={isDrawerOpen}
          onOpen={() => setDrawerOpen(true)}
        />
      </Box>
      <NavSheet user={user} />
    </Nav>
  );
}
