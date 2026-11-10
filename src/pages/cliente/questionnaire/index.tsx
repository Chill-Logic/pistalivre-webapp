import { useParams } from "react-router-dom";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { ExternalLink } from "@/components/atoms/external-link";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { QuestionnaireProgress } from "@/components/molecules/questionnaire-progress";
import { QuestionnaireFleetCard } from "@/components/organisms/questionnaire-fleet-card";
import { QuestionnairePlanPicker } from "@/components/organisms/questionnaire-plan-picker";
import { QuestionnaireQualificationForm } from "@/components/organisms/questionnaire-qualification-form";
import { QuestionnaireRegistrationForm } from "@/components/organisms/questionnaire-registration-form";
import { PublicLayout } from "@/components/templates/public-layout";
import { errorMessage, toApiError } from "@/helpers/api-error";
import { useQuestionnaire } from "@/hooks/api/cliente/public-lead/useQuestionnaire";
import { useQuestionnaireSteps } from "@/hooks/api/cliente/public-lead/useQuestionnaireSteps";
import type { QuestionnairePlan } from "@/types/public-lead";

function StepHeader({
  greeting,
  text,
  step,
}: {
  greeting: string;
  text: string;
  step: 1 | 2 | 3 | 4;
}) {
  return (
    <Box className="space-y-4">
      <Box className="space-y-1">
        <Heading className="text-xl">{greeting}</Heading>
        <Text tone="muted">{text}</Text>
      </Box>
      <QuestionnaireProgress current={step} />
    </Box>
  );
}

function ChosenPlan({ plan, label }: { plan: QuestionnairePlan; label: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 pt-6">
        <Box className="min-w-0">
          <Text size="xs" tone="muted">
            {label}
          </Text>
          <Text weight="medium">{plan.name}</Text>
          <Text size="xs" tone="muted">
            {plan.terms}
          </Text>
        </Box>
        <Badge className="shrink-0">{plan.price}</Badge>
      </CardContent>
    </Card>
  );
}

/** The public questionnaire, one step at a time, resumable from the link. */
export function QuestionnairePage() {
  const { token = "" } = useParams();
  const query = useQuestionnaire(token);
  const steps = useQuestionnaireSteps(token);
  const state = query.data;

  if (query.isError) {
    const unavailable = toApiError(query.error).status === 410;
    return (
      <PublicLayout>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {unavailable ? "Link indisponível" : "Não foi possível abrir"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text tone="muted">{errorMessage(query.error)}</Text>
          </CardContent>
        </Card>
      </PublicLayout>
    );
  }

  if (!state) {
    return (
      <PublicLayout>
        <QuestionnaireSkeleton />
      </PublicLayout>
    );
  }

  const name = state.firstName;

  if (state.step === "QUALIFICATION") {
    return (
      <PublicLayout>
        <StepHeader
          greeting={`${name ?? "Olá"}, antes de te apresentar os planos…`}
          text="…queremos entender melhor seu perfil e o que você procura. São 4 perguntas."
          step={1}
        />
        <Card>
          <CardContent className="pt-6">
            <QuestionnaireQualificationForm
              options={state.options}
              pending={steps.qualification.isPending}
              error={steps.qualification.error}
              onSubmit={(input) => steps.qualification.mutate(input)}
            />
          </CardContent>
        </Card>
      </PublicLayout>
    );
  }

  if (state.step === "PLANS") {
    return (
      <PublicLayout>
        <StepHeader
          greeting={`${name ?? "Olá"}, olha o que a gente tem pra você`}
          text="Escolha o plano que faz mais sentido. Dá pra mudar depois, é só falar com a gente."
          step={2}
        />
        <QuestionnairePlanPicker
          plans={state.plans}
          pending={steps.plan.isPending}
          error={steps.plan.error}
          onChoose={(planId) => steps.plan.mutate(planId)}
        />
        <QuestionnaireFleetCard fleet={state.fleet} />
      </PublicLayout>
    );
  }

  if (state.step === "REGISTRATION") {
    return (
      <PublicLayout>
        <StepHeader
          greeting={`${name ?? "Olá"}, falta só o cadastro`}
          text="Precisamos destes dados para elaborar o contrato de locação."
          step={3}
        />
        {state.plan && <ChosenPlan plan={state.plan} label="Plano escolhido" />}
        <Card>
          <CardContent className="pt-6">
            <QuestionnaireRegistrationForm
              defaults={state.defaults}
              options={state.options}
              pending={steps.registration.isPending}
              onSubmit={(input) =>
                steps.registration.mutateAsync(input).then((whatsappUrl) => {
                  // Straight to the chat with the message written. A navigation,
                  // not a popup: a blocker would kill window.open after await.
                  if (whatsappUrl) window.location.assign(whatsappUrl);
                })
              }
            />
          </CardContent>
        </Card>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <StepHeader
        greeting={`Prontinho${name ? `, ${name}` : ""}!`}
        text={
          state.whatsappUrl
            ? "Recebemos seus dados. Toque em Finalizar pra mandar o resumo pra gente no WhatsApp: a mensagem já vai escrita."
            : "Recebemos seus dados. Nossa equipe vai conferir tudo e falar com você pelo WhatsApp para finalizar o contrato."
        }
        step={4}
      />
      {state.whatsappUrl && (
        <Button asChild className="w-full">
          <ExternalLink
            href={state.whatsappUrl}
            className="text-primary-foreground hover:no-underline"
          >
            Finalizar
          </ExternalLink>
        </Button>
      )}
      {state.plan && <ChosenPlan plan={state.plan} label="Seu plano" />}
    </PublicLayout>
  );
}

export function QuestionnaireSkeleton() {
  return (
    <Box className="space-y-6">
      <Box className="space-y-4">
        <Box className="space-y-2">
          <Skeleton shape="text" className="w-3/4 text-xl" />
          <Skeleton shape="text" className="w-full text-sm" />
        </Box>
        <Box className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-1.5 flex-1 rounded-full" />
          ))}
        </Box>
      </Box>
      <Card>
        <CardContent className="space-y-6 pt-6">
          {[0, 1, 2, 3].map((index) => (
            <Box key={index} className="space-y-2">
              <Skeleton shape="text" className="w-2/3 text-sm" />
              <Skeleton className="h-11 md:h-9" />
            </Box>
          ))}
          <Skeleton className="h-11 md:h-9" />
        </CardContent>
      </Card>
    </Box>
  );
}
