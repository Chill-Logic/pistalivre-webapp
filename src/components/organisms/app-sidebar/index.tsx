import { Box } from "@/components/atoms/box";
import { Aside } from "@/components/atoms/landmarks";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/atoms/sheet";
import { Logo } from "@/components/molecules/logo";
import { SidebarCollapseToggle } from "@/components/molecules/sidebar-collapse-toggle";
import { SidebarNav } from "@/components/molecules/sidebar-nav";
import { SIDEBAR_WIDTH } from "@/constants/layout";
import { SIDEBAR_NAV } from "@/constants/navigation";
import { useSidebar } from "@/hooks/ui/useSidebar";

/**
 * Same content, two shapes: a column that collapses to icons on desktop, a
 * drawer on mobile. Follows the theme (card surface), per brand tokens.
 */
export function AppSidebar() {
  const { isDesktop, isCollapsed, isDrawerOpen, setDrawerOpen, closeDrawer } =
    useSidebar();

  if (!isDesktop) {
    return (
      <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="pb-safe-b pt-safe-t">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Navegação do Pista Livre
          </SheetDescription>
          <Box className="flex h-14 shrink-0 items-center px-4">
            <Logo />
          </Box>
          <Box className="flex-1 overflow-y-auto p-3">
            <SidebarNav items={SIDEBAR_NAV} onNavigate={closeDrawer} />
          </Box>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Aside
      className="sticky top-0 flex h-dvh shrink-0 flex-col border-r bg-card transition-[width] duration-300 ease-in-out motion-reduce:transition-none"
      style={{
        width: isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
      }}
    >
      <Box className="flex h-14 shrink-0 items-center justify-center px-3">
        <Logo withName={!isCollapsed} />
      </Box>
      <Box className="flex-1 overflow-y-auto overflow-x-hidden p-3">
        <SidebarNav items={SIDEBAR_NAV} collapsed={isCollapsed} />
      </Box>
      <Box className="shrink-0 border-t p-3">
        <SidebarCollapseToggle />
      </Box>
    </Aside>
  );
}
