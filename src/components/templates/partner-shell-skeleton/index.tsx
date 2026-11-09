import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { PageSkeleton } from "@/components/templates/page-skeleton";
import { SIDEBAR_WIDTH } from "@/constants/layout";
import { PARTNER_NAV_ITEMS } from "@/constants/partner-area";

/** Same frame as PartnerShell while the session is being validated. */
export function PartnerShellSkeleton() {
  return (
    <SkeletonRegion
      label="Abrindo a área do parceiro…"
      className="flex min-h-dvh"
    >
      <Box
        className="hidden h-dvh shrink-0 flex-col border-r bg-card lg:flex"
        style={{ width: SIDEBAR_WIDTH.expanded }}
      >
        <Box className="flex h-14 items-center justify-center px-3">
          <Skeleton className="h-8 w-28" />
        </Box>
        <Box className="space-y-1 p-3">
          {PARTNER_NAV_ITEMS.map((item) => (
            <Box key={item.to} className="flex h-9 items-center gap-3 px-3">
              <Skeleton className="size-5" />
              <Skeleton shape="text" className="w-20 text-sm" />
            </Box>
          ))}
        </Box>
      </Box>
      <Box className="min-w-0 flex-1">
        <Box className="border-b bg-card">
          <Box className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 lg:mx-0 lg:max-w-none lg:px-8">
            <Skeleton shape="circle" className="size-8 lg:hidden" />
            <Skeleton shape="text" className="w-28 flex-none" />
            <Box className="flex-1" />
            <Skeleton className="size-8" />
            <Skeleton className="h-8 w-20 lg:hidden" />
            <Skeleton className="h-8 w-16" />
          </Box>
        </Box>
        <Box className="mx-auto max-w-5xl px-4 pt-4 md:pt-6 lg:mx-0 lg:max-w-none lg:px-8">
          <PageSkeleton />
        </Box>
      </Box>
    </SkeletonRegion>
  );
}
