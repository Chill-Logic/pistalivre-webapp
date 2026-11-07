import type { ComponentProps } from "react";
import { badgeVariants, type BadgeVariantProps } from "./variants";
import { cn } from "@/utils/cn";

/** Renders a <span>, so it is valid inside <p> (unlike a div-based badge). */
export function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & BadgeVariantProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
