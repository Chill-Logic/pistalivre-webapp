import { Box } from "@/components/atoms/box";
import { Aside } from "@/components/atoms/landmarks";
import { Credits } from "@/components/molecules/credits";
import { Logo } from "@/components/molecules/logo";
import { SidebarCollapseToggle } from "@/components/molecules/sidebar-collapse-toggle";
import { SidebarNav } from "@/components/molecules/sidebar-nav";
import { SIDEBAR_WIDTH } from "@/constants/layout";
import { useNavItems } from "@/hooks/ui/useNavItems";
import { useSidebar } from "@/hooks/ui/useSidebar";

/**
 * Desktop column that collapses to icons (the round button on its edge).
 * Follows the theme (card surface), per brand tokens.
 */
export function AppSidebar() {
  const { isDesktop, isCollapsed } = useSidebar();
  const navItems = useNavItems();

  // Mobile navigation is the bottom bar + menu sheet.
  if (!isDesktop) return null;

  return (
    <Aside
      className="sticky top-0 z-40 flex h-dvh shrink-0 flex-col border-r bg-card transition-[width] duration-300 ease-in-out motion-reduce:transition-none"
      style={{
        width: isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
      }}
    >
      <Box className="flex h-14 shrink-0 items-center justify-center px-3">
        <Logo size={isCollapsed ? "sm" : "xl"} />
      </Box>
      <Box className="scrollbar-quiet flex-1 overflow-y-auto overflow-x-hidden p-3">
        <SidebarNav items={navItems} collapsed={isCollapsed} />
      </Box>
      {!isCollapsed && <Credits className="shrink-0 border-t px-4 py-3" />}
      <SidebarCollapseToggle />
    </Aside>
  );
}
