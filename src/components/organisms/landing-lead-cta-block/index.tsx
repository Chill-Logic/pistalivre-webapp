import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { ExternalLink } from "@/components/atoms/external-link";
import { Heading } from "@/components/atoms/heading";
import { Text } from "@/components/atoms/text";
import { LEAD_CAPTURE_URL } from "@/constants/landing";

export type LandingLeadCtaProps = { title: string; text: string; buttonLabel: string };

/** The call to the lead form (app.cliente…/quero-alugar, with the UTMs). */
export function LandingLeadCtaBlock({ title, text, buttonLabel }: LandingLeadCtaProps) {
  return (
    <Box className="px-4 py-12 md:px-10">
      <Box className="mx-auto max-w-3xl space-y-4 rounded-2xl border bg-card p-8 text-center shadow-sm">
        <Heading level={2} className="text-2xl md:text-3xl">
          {title}
        </Heading>
        <Text tone="muted" size="base">
          {text}
        </Text>
        <Button asChild size="lg">
          <ExternalLink href={LEAD_CAPTURE_URL} className="text-primary-foreground hover:no-underline">
            {buttonLabel}
          </ExternalLink>
        </Button>
      </Box>
    </Box>
  );
}
