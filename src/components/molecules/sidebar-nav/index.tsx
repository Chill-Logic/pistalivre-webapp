import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Nav } from "@/components/atoms/landmarks";
import { Text } from "@/components/atoms/text";
import { NavGroup } from "@/components/molecules/nav-group";
import { NavLink } from "@/components/molecules/nav-link";
import { NavSearch } from "@/components/molecules/nav-search";
import { isNavGroup, type NavEntry } from "@/constants/navigation";
import { searchNav } from "@/helpers/nav-search";

type SidebarNavProps = {
  items: NavEntry[];
  collapsed?: boolean;
  onNavigate?: () => void;
  /** "Buscar no menu" on top (hidden while collapsed to icons). */
  searchable?: boolean;
};

export function SidebarNav({
  items,
  collapsed,
  onNavigate,
  searchable,
}: SidebarNavProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const showSearch = searchable && !collapsed;
  const found = showSearch && query.trim() ? searchNav(items, query) : null;

  const open = (to: string) => {
    setQuery("");
    onNavigate?.();
    navigate(to);
  };

  return (
    <Box className="flex flex-col gap-2">
      {showSearch && (
        <NavSearch
          value={query}
          onChange={setQuery}
          onSubmit={() => found?.[0] && open(found[0].item.to)}
        />
      )}
      <Nav aria-label="Navegação principal" className="flex flex-col gap-1">
        {found ? (
          found.length === 0 ? (
            <Text size="sm" tone="muted" className="px-3 py-2">
              Nada no menu com “{query.trim()}”.
            </Text>
          ) : (
            found.map(({ item, group }) => (
              <Box key={item.to}>
                {group && (
                  <Text size="xs" tone="muted" className="px-3 pt-1">
                    {group}
                  </Text>
                )}
                <NavLink
                  item={item}
                  layout="side"
                  onNavigate={() => {
                    setQuery("");
                    onNavigate?.();
                  }}
                />
              </Box>
            ))
          )
        ) : (
          items.map((entry) =>
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
          )
        )}
      </Nav>
    </Box>
  );
}
