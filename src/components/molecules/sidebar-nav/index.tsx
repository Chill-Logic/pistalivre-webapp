import { Box } from "@/components/atoms/box";
import { Nav } from "@/components/atoms/landmarks";
import { NavGroup } from "@/components/molecules/nav-group";
import { NavLink } from "@/components/molecules/nav-link";
import { SearchTrigger } from "@/components/molecules/search-trigger";
import { isNavGroup, type NavEntry } from "@/constants/navigation";

type SidebarNavProps = {
  items: NavEntry[];
  collapsed?: boolean;
  onNavigate?: () => void;
  /** The universal search (Ctrl+K) on top (hidden while collapsed to icons). */
  searchable?: boolean;
};

export function SidebarNav({
  items,
  collapsed,
  onNavigate,
  searchable,
}: SidebarNavProps) {
  const showSearch = searchable && !collapsed;

  return (
    <Box className="flex flex-col gap-2">
      {showSearch && <SearchTrigger onOpen={onNavigate} />}
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
    </Box>
  );
}
