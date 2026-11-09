import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { PageSkeleton } from "@/components/templates/page-skeleton";

/** Same frame as PartnerShell while the session is being validated. */
export function PartnerShellSkeleton() {
  return (
    <SkeletonRegion label="Abrindo a área do parceiro…" className="min-h-dvh">
      <Box className="border-b bg-card">
        <Box className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Skeleton shape="circle" className="size-8" />
          <Skeleton shape="text" className="w-28 flex-none" />
          <Box className="flex-1" />
          <Skeleton className="size-8" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </Box>
      </Box>
      <Box className="mx-auto max-w-5xl px-4 pt-4 md:pt-6">
        <PageSkeleton />
      </Box>
    </SkeletonRegion>
  );
}
