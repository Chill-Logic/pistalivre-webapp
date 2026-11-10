import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { ExternalLink } from "@/components/atoms/external-link";
import { Heading } from "@/components/atoms/heading";
import { Text } from "@/components/atoms/text";
import { LeadStartForm, LeadStartFormSkeleton } from "@/components/organisms/lead-start-form";
import { QuestionnaireFlow } from "@/components/organisms/questionnaire-flow";
import { LEAD_CAPTURE_URL } from "@/constants/landing";
import { useLeadForm } from "@/hooks/api/cliente/public-lead/useLeadForm";

export type LandingLeadCtaProps = {
  title: string;
  text: string;
  buttonLabel: string;
  /** `inline` = the form and the questionnaire right here; `button` = a link to them. */
  mode?: "inline" | "button";
};

/**
 * "Quero alugar": the lead form opened on the page and, once sent, the
 * questionnaire's steps in the same place (no new navigation). Or only a
 * button to app.cliente…/quero-alugar.
 */
export function LandingLeadCtaBlock({ title, text, buttonLabel, mode = "inline" }: LandingLeadCtaProps) {
  const form = useLeadForm();
  // undefined = not sent yet; null = sent (the honeypot caught a bot, or no session).
  const [token, setToken] = useState<string | null | undefined>(undefined);

  return (
    <Box className="px-4 py-12 md:px-10">
      <Box className="mx-auto max-w-2xl space-y-6 rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        {token === undefined && (
          <Box className="space-y-2 text-center">
            <Heading level={2} className="text-2xl md:text-3xl">
              {title}
            </Heading>
            <Text tone="muted" size="base">
              {text}
            </Text>
          </Box>
        )}

        {mode === "button" ? (
          <Box className="flex justify-center">
            <Button asChild size="lg">
              <ExternalLink href={LEAD_CAPTURE_URL} className="text-primary-foreground hover:no-underline">
                {buttonLabel}
              </ExternalLink>
            </Button>
          </Box>
        ) : token ? (
          <QuestionnaireFlow token={token} />
        ) : token === null ? (
          <Box className="space-y-1 text-center">
            <Text size="lg" weight="semibold">
              Recebemos seu interesse!
            </Text>
            <Text tone="muted">Em breve nossa equipe entra em contato com você.</Text>
          </Box>
        ) : form.data || form.isError ? (
          <LeadStartForm
            models={form.data?.models ?? []}
            submitLabel={buttonLabel}
            phoneLabel="WhatsApp"
            onStarted={setToken}
          />
        ) : (
          <LeadStartFormSkeleton />
        )}
      </Box>
    </Box>
  );
}
