import { Nav } from "@/components/atoms/landmarks";
import { NavLink } from "@/components/molecules/nav-link";
import type { NavItem } from "@/constants/navigation";

type SidebarNavProps = {
  items: NavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarNav({ items, collapsed, onNavigate }: SidebarNavProps) {
  return (
    <Nav aria-label="Navegação principal" className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          item={item}
          layout="side"
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </Nav>
  );
}
