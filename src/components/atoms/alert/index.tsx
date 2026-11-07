import type { ComponentProps } from "react";
import { alertVariants, type AlertVariantProps } from "./variants";
import { cn } from "@/utils/cn";

/** Feedback box; announced to screen readers (`role="alert"` by default). */
export function Alert({
  className,
  variant,
  role = "alert",
  ...props
}: ComponentProps<"div"> & AlertVariantProps) {
  return (
    <div
      role={role}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}
