import { cva, type VariantProps } from "class-variance-authority";

export const skeletonVariants = cva(
  "animate-pulse bg-foreground/10 motion-reduce:animate-none",
  {
    variants: {
      shape: {
        block: "rounded-md",
        /** One line of text: height follows the font size it stands in for. */
        text: "h-[1em] rounded",
        pill: "rounded-full",
        circle: "aspect-square rounded-full",
      },
    },
    defaultVariants: { shape: "block" },
  },
);

export type SkeletonVariantProps = VariantProps<typeof skeletonVariants>;
