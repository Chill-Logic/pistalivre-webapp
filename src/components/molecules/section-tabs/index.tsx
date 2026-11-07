import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Nav } from "@/components/atoms/landmarks";
import { useActiveTabIndex } from "@/hooks/ui/useActiveTabIndex";
import { cn } from "@/utils/cn";

export type SectionTab = {
  label: string;
  to: string;
  /** Active only on the exact path (the overview tab). */
  end?: boolean;
};

type Indicator = { left: number; width: number };

/**
 * Tabs that are links (each section has its own URL, so back/refresh work).
 * The underline slides to the chosen tab. Scrolls sideways on narrow phones
 * instead of wrapping.
 */
export function SectionTabs({
  tabs,
  label,
}: {
  tabs: SectionTab[];
  label: string;
}) {
  const activeIndex = useActiveTabIndex(tabs);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  useLayoutEffect(() => {
    const link = links.current[activeIndex];
    if (!link) return setIndicator(null);
    setIndicator({ left: link.offsetLeft, width: link.offsetWidth });
    link.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeIndex]);

  return (
    <Nav aria-label={label} className="border-b">
      <Box className="relative -mx-1 flex overflow-x-auto overflow-y-hidden px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab, index) => {
          const active = index === activeIndex;
          return (
            <Link
              key={tab.to}
              ref={(element) => {
                links.current[index] = element;
              }}
              to={tab.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-10",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
        {indicator && (
          <Box
            aria-hidden
            className="absolute bottom-0 h-0.5 rounded-full bg-primary transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
            style={indicator}
          />
        )}
      </Box>
    </Nav>
  );
}
