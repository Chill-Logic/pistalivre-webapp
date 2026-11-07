import type { ComponentProps } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

/** In-app link inside text (names, codes, plates). */
export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-4 hover:text-primary hover:decoration-primary",
        className,
      )}
      {...props}
    />
  );
}
