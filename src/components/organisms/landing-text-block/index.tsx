import { Box } from "@/components/atoms/box";
import { Heading } from "@/components/atoms/heading";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

export type LandingTextProps = {
  eyebrow: string;
  title: string;
  text: string;
  align: "left" | "center";
};

/** A heading with an optional line above it and a paragraph. */
export function LandingTextBlock({ eyebrow, title, text, align }: LandingTextProps) {
  const centered = align === "center";
  return (
    <Box className={cn("space-y-3", centered && "mx-auto max-w-2xl text-center")}>
      {eyebrow && (
        <Text size="xs" weight="semibold" className="uppercase tracking-widest text-primary">
          {eyebrow}
        </Text>
      )}
      {title && <Heading level={2} className="text-2xl md:text-4xl">{title}</Heading>}
      {text && (
        <Text size="lg" tone="muted" className="whitespace-pre-line">
          {text}
        </Text>
      )}
    </Box>
  );
}
