import type { ReactElement } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/atoms/tooltip";

type TooltipWhenCollapsedProps = {
  collapsed: boolean;
  label: string;
  children: ReactElement;
};

/**
 * The label as a hint ONLY when the sidebar is collapsed: expanded, it is
 * already written next to the icon, and repeating it is noise.
 */
export function TooltipWhenCollapsed({
  collapsed,
  label,
  children,
}: TooltipWhenCollapsedProps) {
  if (!collapsed) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
