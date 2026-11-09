import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

/** Preformatted text (commands, JSON): monospace, scrolls sideways, keeps spaces. */
export function CodeBlock({ className, ...props }: ComponentProps<"pre">) {
  return (
    <pre
      className={cn(
        "overflow-x-auto whitespace-pre rounded-md border bg-muted/50 p-3 font-mono text-xs leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}
