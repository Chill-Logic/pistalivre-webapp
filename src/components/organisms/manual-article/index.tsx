import { ArrowLeft, ArrowRight, Link2 } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Heading } from "@/components/atoms/heading";
import { Text } from "@/components/atoms/text";
import type { GuideSection } from "@/types/guide";
import { guideSteps } from "@/utils/guide";

type ManualArticleProps = {
  section: GuideSection;
  previous: GuideSection | null;
  next: GuideSection | null;
  onPick: (id: string) => void;
  onCopyLink: () => void;
};

/**
 * One section of the manual, docs style: the chapter as an eyebrow, the
 * title, then the how-to as numbered steps (01, 02…), and the way to the
 * previous/next section at the end.
 */
export function ManualArticle({ section, previous, next, onPick, onCopyLink }: ManualArticleProps) {
  const steps = guideSteps(section);
  return (
    <Box className="space-y-8">
      <Box className="space-y-3">
        <Box className="flex items-center justify-between gap-3">
          <Text size="xs" tone="primary" weight="semibold" mono className="uppercase tracking-[0.18em]">
            {section.area}
          </Text>
          <Button variant="ghost" size="sm" onClick={onCopyLink} className="shrink-0">
            <Link2 />
            Copiar link
          </Button>
        </Box>
        <Heading className="text-2xl md:text-3xl">{section.title}</Heading>
      </Box>

      <Box className="space-y-6">
        {steps.map((step, i) => (
          <Box key={i} className="flex gap-4">
            <Box className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/40">
              <Text size="xs" weight="semibold" mono>
                {String(i + 1).padStart(2, "0")}
              </Text>
            </Box>
            <Text size="base" className="leading-relaxed text-foreground/90">
              {step}
            </Text>
          </Box>
        ))}
      </Box>

      {(previous || next) && (
        <Box className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
          {previous ? (
            <Button
              variant="outline"
              onClick={() => onPick(previous.id)}
              className="h-auto justify-start whitespace-normal py-2 text-left sm:max-w-[48%] md:h-auto"
            >
              <ArrowLeft />
              <Box className="min-w-0">
                <Text size="xs" tone="muted">
                  Anterior
                </Text>
                <Text weight="semibold">{previous.title}</Text>
              </Box>
            </Button>
          ) : (
            <Box />
          )}
          {next && (
            <Button
              variant="outline"
              onClick={() => onPick(next.id)}
              className="h-auto justify-end whitespace-normal py-2 text-right sm:max-w-[48%] md:h-auto"
            >
              <Box className="min-w-0">
                <Text size="xs" tone="muted">
                  Próximo
                </Text>
                <Text weight="semibold">{next.title}</Text>
              </Box>
              <ArrowRight />
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
