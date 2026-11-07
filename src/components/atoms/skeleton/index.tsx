import type { ComponentProps } from "react";
import { skeletonVariants, type SkeletonVariantProps } from "./variants";
import { cn } from "@/utils/cn";

/** Placeholder shape. Decorative: the surrounding SkeletonRegion announces loading. */
export function Skeleton({
  className,
  shape,
  ...props
}: ComponentProps<"div"> & SkeletonVariantProps) {
  return (
    <div
      aria-hidden
      className={cn(skeletonVariants({ shape }), className)}
      {...props}
    />
  );
}
