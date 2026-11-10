import { Box } from "@/components/atoms/box";
import { Heading } from "@/components/atoms/heading";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";

export type LandingFaqProps = {
  title: string;
  items: { question: string; answer: string }[];
};

/** Frequently asked questions, as written in the editor. */
export function LandingFaqBlock({ title, items }: LandingFaqProps) {
  return (
    <Box className="mx-auto max-w-3xl space-y-6 px-4 py-12 md:px-10">
      <Heading level={2} className="text-center text-2xl md:text-3xl">
        {title}
      </Heading>
      <List className="divide-y rounded-xl border">
        {(items ?? []).map((item, index) => (
          <ListItem key={`${item.question}-${index}`} className="space-y-1 p-4">
            <Text size="base" weight="semibold">
              {item.question}
            </Text>
            <Text tone="muted">{item.answer}</Text>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
