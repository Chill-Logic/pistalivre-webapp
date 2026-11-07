import { Box } from "@/components/atoms/box";
import { Aside, Nav } from "@/components/atoms/landmarks";
import { Logo } from "@/components/molecules/logo";
import { NavLink } from "@/components/molecules/nav-link";
import { MAIN_NAV } from "@/constants/navigation";

/** Desktop navigation. Follows the theme (card surface), per brand tokens. */
export function AppSidebar() {
  return (
    <Aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
      <Box className="flex h-14 items-center border-b px-4">
        <Logo />
      </Box>
      <Nav aria-label="Navegação principal" className="flex flex-col gap-1 p-3">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.to} item={item} layout="side" />
        ))}
      </Nav>
    </Aside>
  );
}
