import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Heading } from "@/components/atoms/heading";
import { Text } from "@/components/atoms/text";
import { LeadStartForm, LeadStartFormSkeleton } from "@/components/organisms/lead-start-form";
import { PublicLayout } from "@/components/templates/public-layout";
import { routeTo } from "@/constants/routes";
import { useLeadForm } from "@/hooks/api/cliente/public-lead/useLeadForm";

/** The questionnaire's public entry (campaign link): who is arriving, then step 1. */
export function QuestionnaireStartPage() {
  const form = useLeadForm();
  const navigate = useNavigate();
  const onStarted = (token: string | null) => {
    if (token) navigate(routeTo.portalQuestionnaire(token), { replace: true });
  };

  return (
    <PublicLayout companyName={form.data?.companyName}>
      <Box className="space-y-1 text-center">
        <Heading>Alugue com a gente</Heading>
        <Text tone="muted">
          Antes de apresentar os planos, a gente faz algumas perguntas rápidas
          pra entender seu perfil. Leva 2 minutos.
        </Text>
      </Box>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vamos começar</CardTitle>
        </CardHeader>
        <CardContent>
          {form.data || form.isError ? (
            <LeadStartForm
              models={form.data?.models ?? []}
              submitLabel="Começar"
              phoneLabel="WhatsApp"
              onStarted={onStarted}
            />
          ) : (
            <LeadStartFormSkeleton />
          )}
        </CardContent>
      </Card>
    </PublicLayout>
  );
}
