import { cva, type VariantProps } from "class-variance-authority";

export const headingVariants = cva("tracking-tight", {
  variants: {
    variant: {
      page: "text-2xl font-bold",
      section: "text-base font-semibold leading-none",
      title: "text-xl font-semibold",
    },
  },
  defaultVariants: { variant: "page" },
});

export type HeadingVariantProps = VariantProps<typeof headingVariants>;
