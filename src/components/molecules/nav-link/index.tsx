import { Link, matchPath, useLocation } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { TooltipWhenCollapsed } from "@/components/molecules/tooltip-when-collapsed";
import type { NavItem } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { useIsActiveRoute } from "@/hooks/ui/useIsActiveRoute";
import { cn } from "@/utils/cn";

type NavLinkProps = {
  item: NavItem;
  /** `bar` = mobile bottom bar, `side` = sidebar (column or drawer). */
  layout: "bar" | "side";
  /** Icon-only sidebar: the label becomes a tooltip. */
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function NavLink({
  item,
  layout,
  collapsed = false,
  onNavigate,
}: NavLinkProps) {
  const Icon = item.icon;
  const { pathname } = useLocation();
  const isActive =
    useIsActiveRoute(item.to, item.exact || item.to === ROUTES.dashboard) &&
    !(item.except ?? []).some((path) => matchPath({ path, end: false }, pathname));

  return (
    <TooltipWhenCollapsed collapsed={collapsed} label={item.label}>
      <Link
        to={item.to}
        onClick={onNavigate}
        aria-label={collapsed ? item.label : undefined}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center transition-[color,background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          layout === "bar" &&
            "group min-h-14 flex-1 flex-col justify-center gap-1 text-[11px] font-medium",
          layout === "side" &&
            "h-11 rounded-md text-sm font-medium hover:bg-accent active:scale-[0.98] md:h-9",
          layout === "side" && (collapsed ? "justify-center" : "gap-3 px-3"),
          isActive
            ? cn(
                "text-primary",
                layout === "side" && "bg-primary/10 hover:bg-primary/10",
              )
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {layout === "bar" ? (
          <Box
            className={cn(
              "flex h-7 w-12 items-center justify-center rounded-full transition-[background-color,transform] duration-300 ease-out group-active:scale-90",
              isActive && "bg-primary/10",
            )}
          >
            <Icon
              className={cn(
                "size-5 shrink-0 transition-transform duration-300 ease-out",
                isActive && "scale-110",
              )}
              aria-hidden
            />
          </Box>
        ) : (
          <Icon className="size-5 shrink-0" aria-hidden />
        )}
        {!collapsed && (
          <Text inline size={null} truncate>
            {item.label}
          </Text>
        )}
      </Link>
    </TooltipWhenCollapsed>
  );
}
