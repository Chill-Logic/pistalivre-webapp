import { Logo } from "@/components/atoms/logo";
import { NavLink } from "@/components/molecules/nav-link";
import { MAIN_NAV } from "@/constants/navigation";

/** Desktop navigation. Follows the theme (card surface), per brand tokens. */
export function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Logo />
      </div>
      <nav aria-label="Navegação principal" className="flex flex-col gap-1 p-3">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.to} item={item} layout="side" />
        ))}
      </nav>
    </aside>
  );
}
