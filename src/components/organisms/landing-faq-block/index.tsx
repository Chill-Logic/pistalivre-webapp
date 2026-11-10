import { LandingSectionShell } from "@/components/molecules/landing-section-shell";
import type { LandingSectionStyle } from "@/types/landing";
import { Heading } from "@/components/atoms/heading";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";

export type LandingFaqProps = LandingSectionStyle & {
  title: string;
  items: { question: string; answer: string }[];
};

/** Frequently asked questions, as written in the editor. */
export function LandingFaqBlock({ title, items, background = "white", spacing, backgroundImage }: LandingFaqProps) {
  return (
    <LandingSectionShell
      background={background}
      spacing={spacing}
      width="narrow"
      imageUrl={backgroundImage}
      className="space-y-6"
    >
      <Heading level={2} className="text-center text-2xl md:text-3xl">
        {title}
      </Heading>
      <List className="divide-y rounded-xl border bg-card">
        {(items ?? []).map((item, index) => (
          <ListItem key={`${item.question}-${index}`} className="space-y-1 p-4">
            <Text size="base" weight="semibold">
              {item.question}
            </Text>
            <Text tone="muted">{item.answer}</Text>
          </ListItem>
        ))}
      </List>
    </LandingSectionShell>
  );
}
