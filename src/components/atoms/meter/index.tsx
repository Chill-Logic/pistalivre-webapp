import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

type MeterProps = Omit<ComponentProps<"div">, "color"> & {
  /** Filled share, 0 to 1. */
  value: number;
  /** Fill color (chart palette); defaults to the brand red. */
  color?: string;
  orientation?: "horizontal" | "vertical";
};

/**
 * Proportional bar for the dashboard charts. Pure CSS: no chart library,
 * nothing the browser draws on its own. Decorative — the value is always
 * written next to it.
 */
export function Meter({
  value,
  color,
  orientation = "horizontal",
  className,
  ...props
}: MeterProps) {
  const percent = `${Math.min(Math.max(value, 0), 1) * 100}%`;
  const vertical = orientation === "vertical";
  return (
    <div
      aria-hidden
      className={cn(
        "flex overflow-hidden rounded bg-foreground/5",
        vertical ? "h-full w-full flex-col justify-end" : "h-2.5 w-full",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "bg-primary transition-[width,height] duration-500 motion-reduce:transition-none",
          vertical ? "w-full rounded-t" : "h-full rounded-r",
        )}
        style={{
          [vertical ? "height" : "width"]: percent,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

/** Small color swatch for chart legends. */
export function Swatch({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color }}
    />
  );
}
