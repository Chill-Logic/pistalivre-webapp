import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { SkeletonText } from "@/components/molecules/skeleton-text";

/** Generic page while its code chunk loads (lazy routes). */
export function PageSkeleton() {
  return (
    <SkeletonRegion className="space-y-6">
      <SkeletonText lines={["w-40 text-2xl", "w-56 text-sm"]} />
      <Box className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="hidden h-32 sm:block" />
      </Box>
    </SkeletonRegion>
  );
}
