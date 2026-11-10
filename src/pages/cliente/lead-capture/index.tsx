import { useState } from "react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Heading } from "@/components/atoms/heading";
import { Text } from "@/components/atoms/text";
import { LeadStartForm, LeadStartFormSkeleton } from "@/components/organisms/lead-start-form";
import { PublicLayout } from "@/components/templates/public-layout";
import { routeTo } from "@/constants/routes";
import { useLeadForm } from "@/hooks/api/cliente/public-lead/useLeadForm";

/** "Quero alugar" (public): leaves the contact and opens the questionnaire too. */
export function LeadCapturePage() {
  const form = useLeadForm();
  const [sent, setSent] = useState<{ token: string | null } | null>(null);

  return (
    <PublicLayout companyName={form.data?.companyName}>
      <Box className="space-y-1 text-center">
        <Heading>Quero alugar</Heading>
        <Text tone="muted">
          Alugue sua moto ou veículo com a gente. Deixe seu contato que a gente
          te chama!
        </Text>
      </Box>
      <Card>
        {sent ? (
          <CardContent className="space-y-4 pt-6 text-center">
            <Box className="space-y-1">
              <Text size="lg" weight="semibold">
                Recebemos seu interesse!
              </Text>
              <Text tone="muted">
                Em breve nossa equipe entra em contato com você.
              </Text>
            </Box>
            {sent.token && (
              <Box className="space-y-3">
                <Text>
                  Quer adiantar? Responda algumas perguntas rápidas e já veja os
                  planos que fazem sentido pra você.
                </Text>
                <Button asChild className="w-full">
                  <Link to={routeTo.portalQuestionnaire(sent.token)}>
                    Responder agora (2 min)
                  </Link>
                </Button>
              </Box>
            )}
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-base">Seus dados</CardTitle>
            </CardHeader>
            <CardContent>
              {form.data || form.isError ? (
                <LeadStartForm
                  models={form.data?.models ?? []}
                  submitLabel="Quero alugar"
                  phoneLabel="WhatsApp / telefone"
                  onStarted={(token) => setSent({ token })}
                />
              ) : (
                <LeadStartFormSkeleton />
              )}
            </CardContent>
          </>
        )}
      </Card>
    </PublicLayout>
  );
}
