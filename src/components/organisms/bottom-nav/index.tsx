import { NavLink } from "@/components/molecules/nav-link";
import { MAIN_NAV } from "@/constants/navigation";

/** Mobile navigation, fixed at the thumb's reach. Hidden from `md` up. */
export function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-safe-b md:hidden"
    >
      <div className="flex">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.to} item={item} layout="bar" />
        ))}
      </div>
    </nav>
  );
}
