import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { buttonVariants, type ButtonVariantProps } from "./variants";
import { cn } from "@/utils/cn";

export type ButtonProps = ComponentProps<"button"> &
  ButtonVariantProps & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
