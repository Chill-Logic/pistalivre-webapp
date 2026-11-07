import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { TooltipWhenCollapsed } from "@/components/molecules/tooltip-when-collapsed";
import { useSidebar } from "@/hooks/ui/useSidebar";
import { cn } from "@/utils/cn";

/** Desktop only: collapse/expand row at the foot of the sidebar. */
export function SidebarCollapseToggle() {
  const { isDesktop, isCollapsed, toggleCollapsed } = useSidebar();
  if (!isDesktop) return null;

  const label = isCollapsed ? "Expandir menu" : "Recolher menu";
  const Icon = isCollapsed ? ChevronsRight : ChevronsLeft;

  return (
    <TooltipWhenCollapsed collapsed={isCollapsed} label={label}>
      <Button
        variant="ghost"
        onClick={toggleCollapsed}
        aria-label={label}
        aria-expanded={!isCollapsed}
        className={cn(
          "w-full text-muted-foreground",
          isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-3",
        )}
      >
        <Icon />
        {!isCollapsed && (
          <Text inline size={null}>
            Recolher
          </Text>
        )}
      </Button>
    </TooltipWhenCollapsed>
  );
}
