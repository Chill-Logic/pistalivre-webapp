import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

/** Link that leaves the app (new tab, no opener). */
export function ExternalLink({ className, ...props }: ComponentProps<"a">) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline",
        className,
      )}
      {...props}
    />
  );
}
