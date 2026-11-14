import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { TooltipWhenCollapsed } from "@/components/molecules/tooltip-when-collapsed";
import { useSidebar } from "@/hooks/ui/useSidebar";
import { cn } from "@/utils/cn";

/**
 * Desktop only: round button straddling the sidebar's right edge,
 * centered on the header's bottom line (h-14 − half the button).
 * The chevron turns instead of swapping icons.
 */
export function SidebarCollapseToggle() {
  const { isDesktop, isCollapsed, toggleCollapsed } = useSidebar();
  if (!isDesktop) return null;

  const label = isCollapsed ? "Expandir menu" : "Recolher menu";

  return (
    <TooltipWhenCollapsed collapsed label={label}>
      <Button
        size="icon"
        variant="outline"
        onClick={toggleCollapsed}
        aria-label={label}
        aria-expanded={!isCollapsed}
        className="absolute right-0 top-10 z-10 size-8 translate-x-1/2 rounded-full bg-background text-muted-foreground shadow-sm hover:text-foreground md:size-8"
      >
        <ChevronLeft
          className={cn(
            "transition-transform duration-300 ease-out",
            isCollapsed && "rotate-180",
          )}
        />
      </Button>
    </TooltipWhenCollapsed>
  );
}
