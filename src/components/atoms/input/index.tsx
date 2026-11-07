import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        // text-base on mobile: iOS zooms into inputs under 16px.
        "flex h-11 w-full rounded-md border border-input bg-card px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive md:h-9 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}
