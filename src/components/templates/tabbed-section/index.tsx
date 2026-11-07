import { Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { PageHeader } from "@/components/molecules/page-header";
import {
  SectionTabs,
  type SectionTab,
} from "@/components/molecules/section-tabs";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { useActiveTabIndex } from "@/hooks/ui/useActiveTabIndex";

type TabbedSectionProps = {
  title: string;
  tabs: SectionTab[];
  /** Accessible name of the tab list. */
  label: string;
  /** Chunk loaders of the tabs, fetched after the first paint. */
  preload?: (() => unknown)[];
};

/**
 * Layout route of an area with tabs: title and tabs stay put, and only the
 * tab's content slides in from the side of the tab that was chosen.
 */
export function TabbedSection({
  title,
  tabs,
  label,
  preload,
}: TabbedSectionProps) {
  const { pathname } = useLocation();
  const activeIndex = useActiveTabIndex(tabs);
  const previous = useRef(activeIndex);
  const fromRight = activeIndex >= previous.current;
  previous.current = activeIndex;

  // Switching tabs must not wait for the network: fetch the siblings early.
  useEffect(() => {
    const timer = window.setTimeout(
      () => preload?.forEach((load) => load()),
      800,
    );
    return () => window.clearTimeout(timer);
  }, [preload]);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title={title} />
      <SectionTabs tabs={tabs} label={label} />
      <Box className="overflow-x-clip">
        <Box
          key={pathname}
          className={
            fromRight
              ? "duration-300 ease-out animate-in fade-in-0 slide-in-from-right-8 motion-reduce:animate-none"
              : "duration-300 ease-out animate-in fade-in-0 slide-in-from-left-8 motion-reduce:animate-none"
          }
        >
          <Suspense
            fallback={
              <SkeletonRegion className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </SkeletonRegion>
            }
          >
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
