import { cva, type VariantProps } from "class-variance-authority";

export const alertVariants = cva("rounded-md px-3 py-2 text-sm", {
  variants: {
    variant: {
      error: "bg-error text-error-foreground",
      warning: "bg-warning text-warning-foreground",
      success: "bg-success text-success-foreground",
    },
  },
  defaultVariants: { variant: "error" },
});

export type AlertVariantProps = VariantProps<typeof alertVariants>;
