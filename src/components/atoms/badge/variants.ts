import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-secondary text-secondary-foreground",
        success: "bg-success text-success-foreground",
        warning: "bg-warning text-warning-foreground",
        error: "bg-error text-error-foreground",
        outline: "border text-muted-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
