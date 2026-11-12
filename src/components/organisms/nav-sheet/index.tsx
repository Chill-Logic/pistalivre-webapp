import { LogOut } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/atoms/sheet";
import { Text } from "@/components/atoms/text";
import { SidebarNav } from "@/components/molecules/sidebar-nav";
import { Credits } from "@/components/molecules/credits";
import { ThemeToggle } from "@/components/molecules/theme-toggle";
import { useNavItems } from "@/hooks/ui/useNavItems";
import { useLogout } from "@/hooks/auth/useLogout";
import { useSidebar } from "@/hooks/ui/useSidebar";
import type { AuthUser } from "@/types/auth";

type NavSheetProps = {
  user: AuthUser;
};

/**
 * Mobile menu as a bottom sheet: who is signed in, the
 * theme, every destination and "Sair". Fixed height, so only the list
 * scrolls; closes by overlay, Esc or choosing an item.
 */
export function NavSheet({ user }: NavSheetProps) {
  const { isDrawerOpen, setDrawerOpen, closeDrawer } = useSidebar();
  const logout = useLogout();
  const navItems = useNavItems();

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="bottom" className="pb-safe-b">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Navegação do Pista Livre
        </SheetDescription>
        <Box className="flex items-center gap-3 px-5 py-3">
          <Box className="min-w-0 flex-1">
            <Text weight="bold" truncate>
              {user.name}
            </Text>
            <Text size="xs" tone="muted" truncate>
              {user.email}
            </Text>
          </Box>
          <ThemeToggle />
        </Box>
        <Box className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t px-3 py-2">
          <SidebarNav items={navItems} onNavigate={closeDrawer} searchable />
        </Box>
        <Box className="shrink-0 border-t px-3 py-2">
          <Button
            variant="ghost"
            onClick={() => {
              closeDrawer();
              logout();
            }}
            className="w-full justify-start gap-3 px-3 text-destructive hover:text-destructive"
          >
            <LogOut />
            Sair
          </Button>
          <Credits className="px-3 pb-1 pt-2" />
        </Box>
      </SheetContent>
    </Sheet>
  );
}
