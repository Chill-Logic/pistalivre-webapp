import type { ComponentProps } from "react";
import { textVariants, type TextVariantProps } from "./variants";
import { cn } from "@/utils/cn";

type TextProps = ComponentProps<"p"> &
  TextVariantProps & {
    /** Inline text (inside another Text) renders a <span>. */
    inline?: boolean;
  };

export function Text({
  className,
  inline = false,
  size,
  tone,
  weight,
  mono,
  truncate,
  ...props
}: TextProps) {
  const Comp = inline ? "span" : "p";
  return (
    <Comp
      className={cn(
        textVariants({ size, tone, weight, mono, truncate }),
        className,
      )}
      {...props}
    />
  );
}
