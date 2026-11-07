import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { PageSkeleton } from "@/components/templates/page-skeleton";
import { SIDEBAR_WIDTH } from "@/constants/layout";
import { useSidebar } from "@/hooks/ui/useSidebar";

/** Same frame as AppShell while the session is being validated. */
export function AppShellSkeleton() {
  const { isCollapsed } = useSidebar();

  return (
    <SkeletonRegion label="Abrindo o Pista Livre…" className="flex min-h-dvh">
      <Box
        className="hidden shrink-0 flex-col gap-2 border-r bg-card p-3 md:flex"
        style={{
          width: isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
        }}
      >
        <Skeleton className={isCollapsed ? "mb-3 size-8" : "mb-3 h-8 w-36"} />
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-9" />
        ))}
      </Box>
      <Box className="flex min-w-0 flex-1 flex-col">
        <Box className="flex h-14 items-center gap-3 border-b bg-card px-4">
          <Skeleton shape="circle" className="size-8 md:hidden" />
          <Skeleton shape="text" className="w-28" />
        </Box>
        <Box className="flex-1 px-4 pt-4 md:px-8 md:pt-6">
          <PageSkeleton />
        </Box>
      </Box>
      <Box className="fixed inset-x-0 bottom-0 flex h-14 items-center justify-around border-t bg-card md:hidden">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} shape="circle" className="size-6" />
        ))}
      </Box>
    </SkeletonRegion>
  );
}
