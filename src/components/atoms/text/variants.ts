import { cva, type VariantProps } from "class-variance-authority";

export const textVariants = cva("", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      "2xl": "text-2xl",
      "5xl": "text-5xl",
    },
    tone: {
      default: "",
      foreground: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
      success: "text-success-foreground",
    },
    weight: {
      normal: "",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    mono: { true: "font-mono tracking-wide" },
    truncate: { true: "truncate" },
  },
  defaultVariants: { size: "sm", tone: "default", weight: "normal" },
});

export type TextVariantProps = VariantProps<typeof textVariants>;
