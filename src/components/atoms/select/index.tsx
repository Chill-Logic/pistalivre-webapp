import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

/**
 * Native select on purpose: on phones it opens the OS picker, which beats any
 * custom popover for touch. Styled to match the Input atom.
 */
export function Select({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-11 w-full appearance-none rounded-md border border-input bg-card py-1 pl-3 pr-9 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:h-9 md:text-sm",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
