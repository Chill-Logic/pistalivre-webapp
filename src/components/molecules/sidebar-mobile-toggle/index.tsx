import { Menu } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { useSidebar } from "@/hooks/ui/useSidebar";

/** Mobile only: opens the sidebar drawer from the header. */
export function SidebarMobileToggle() {
  const { isDesktop, isDrawerOpen, setDrawerOpen } = useSidebar();
  if (isDesktop) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setDrawerOpen(true)}
      aria-label="Abrir menu"
      aria-expanded={isDrawerOpen}
      className="-ml-2"
    >
      <Menu className="size-5" />
    </Button>
  );
}
