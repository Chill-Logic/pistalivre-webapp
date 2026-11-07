import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Nav } from "@/components/atoms/landmarks";
import { useIsActiveRoute } from "@/hooks/ui/useIsActiveRoute";
import { cn } from "@/utils/cn";

export type SectionTab = {
  label: string;
  to: string;
  /** Active only on the exact path (the overview tab). */
  end?: boolean;
};

function SectionTabLink({ tab }: { tab: SectionTab }) {
  const active = useIsActiveRoute(tab.to, tab.end);
  return (
    <Link
      to={tab.to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-10",
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {tab.label}
    </Link>
  );
}

/**
 * Tabs that are links (each section has its own URL, so back/refresh work).
 * Scrolls sideways on narrow phones instead of wrapping.
 */
export function SectionTabs({
  tabs,
  label,
}: {
  tabs: SectionTab[];
  label: string;
}) {
  return (
    <Nav aria-label={label} className="border-b">
      <Box className="-mx-1 flex overflow-x-auto overflow-y-hidden px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <SectionTabLink key={tab.to} tab={tab} />
        ))}
      </Box>
    </Nav>
  );
}
