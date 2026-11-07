import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

/** Indeterminate progress line (the moving stripe is pure CSS). */
export function ProgressBar({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="progressbar"
      aria-label="Carregando"
      className={cn("h-0.5 w-full overflow-hidden bg-primary/15", className)}
      {...props}
    >
      <div className="h-full w-1/3 animate-progress rounded-full motion-reduce:animate-pulse bg-primary" />
    </div>
  );
}
