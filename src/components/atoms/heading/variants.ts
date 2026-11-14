import { cva, type VariantProps } from "class-variance-authority";

export const headingVariants = cva("[font-stretch:92%]", {
  variants: {
    variant: {
      page: "text-2xl font-bold leading-tight md:text-[1.75rem]",
      section: "text-base font-semibold leading-none",
      title: "text-xl font-semibold",
    },
  },
  defaultVariants: { variant: "page" },
});

export type HeadingVariantProps = VariantProps<typeof headingVariants>;
