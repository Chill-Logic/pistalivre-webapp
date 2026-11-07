import type { ComponentProps } from "react";
import { headingVariants, type HeadingVariantProps } from "./variants";
import { cn } from "@/utils/cn";

type HeadingProps = ComponentProps<"h1"> &
  HeadingVariantProps & {
    level?: 1 | 2 | 3;
  };

/** Document outline (`level`) and look (`variant`) are independent. */
export function Heading({
  level = 1,
  variant,
  className,
  ...props
}: HeadingProps) {
  const Comp = `h${level}` as const;
  return (
    <Comp className={cn(headingVariants({ variant }), className)} {...props} />
  );
}
