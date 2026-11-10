import { Nav } from "@/components/atoms/landmarks";
import { NavGroup } from "@/components/molecules/nav-group";
import { NavLink } from "@/components/molecules/nav-link";
import { isNavGroup, type NavEntry } from "@/constants/navigation";

type SidebarNavProps = {
  items: NavEntry[];
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarNav({ items, collapsed, onNavigate }: SidebarNavProps) {
  return (
    <Nav aria-label="Navegação principal" className="flex flex-col gap-1">
      {items.map((entry) =>
        isNavGroup(entry) ? (
          <NavGroup
            key={entry.label}
            group={entry}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ) : (
          <NavLink
            key={entry.to}
            item={entry}
            layout="side"
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ),
      )}
    </Nav>
  );
}
