import type { ComponentProps } from "react";
import { colClasses, type ColSpans } from "@/helpers/grid";
import { cn } from "@/utils/cn";

/**
 * Row/Col grid (12 columns, 24px gutter) — the house layout pattern, defined
 * in index.css. `as` keeps the markup semantic (lists, description lists).
 * Vertical spacing between wrapped rows comes from `gap-y-*` on the Row.
 */
type RowProps = ComponentProps<"div"> & { as?: "div" | "ul" | "dl" };

export function Row({ as: Comp = "div", className, ...props }: RowProps) {
  return <Comp className={cn("row", className)} {...(props as object)} />;
}

type ColProps = ComponentProps<"div"> & ColSpans & { as?: "div" | "li" };

export function Col({
  as: Comp = "div",
  span,
  sm,
  md,
  lg,
  xl,
  className,
  ...props
}: ColProps) {
  return (
    <Comp
      className={cn(colClasses({ span, sm, md, lg, xl }), "min-w-0", className)}
      {...(props as object)}
    />
  );
}
