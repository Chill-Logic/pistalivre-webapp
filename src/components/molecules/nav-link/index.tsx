import { NavLink as RouterNavLink } from "react-router-dom";
import type { NavItem } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

type NavLinkProps = {
  item: NavItem;
  layout: "bar" | "side";
};

/** One navigation entry; `bar` = mobile bottom bar, `side` = desktop sidebar. */
export function NavLink({ item, layout }: NavLinkProps) {
  const Icon = item.icon;
  return (
    <RouterNavLink
      to={item.to}
      end={item.to === ROUTES.dashboard}
      className={({ isActive }) =>
        cn(
          "flex items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          layout === "bar" &&
            "min-h-14 flex-1 flex-col justify-center gap-1 text-[11px] font-medium",
          layout === "side" &&
            "h-9 gap-3 rounded-md px-3 text-sm font-medium hover:bg-accent",
          isActive
            ? cn(
                "text-primary",
                layout === "side" && "bg-primary/10 hover:bg-primary/10",
              )
            : "text-muted-foreground hover:text-foreground",
        )
      }
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      <span>{item.label}</span>
    </RouterNavLink>
  );
}
