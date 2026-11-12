import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { ExternalLink } from "@/components/atoms/external-link";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { QuestionnaireRegistrationForm } from "@/components/organisms/questionnaire-registration-form";
import { PublicLayout } from "@/components/templates/public-layout";
import { usePreRegistration } from "@/hooks/api/cliente/public-lead/usePreRegistration";

/** The form's shape while the options load. */
function PreRegistrationSkeleton() {
  return (
    <Box className="space-y-6">
      {[0, 1, 2].map((block) => (
        <Box key={block} className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Box>
      ))}
      <Skeleton className="h-10 w-full" />
    </Box>
  );
}

/**
 * /pre-cadastro (no login): the customer sends, in one go, everything the
 * team needs to register them and generate the rental contract — data and
 * documents (CNH + proof of address required). Ends on WhatsApp when the
 * company has a number configured.
 */
export function PreRegistrationPage() {
  const { info, submit } = usePreRegistration();
  const [done, setDone] = useState<{ whatsappUrl: string | null } | null>(null);

  if (done) {
    return (
      <PublicLayout companyName={info.data?.companyName}>
        <Box className="space-y-2 text-center">
          <Heading>Recebemos seus dados</Heading>
          <Text tone="muted">
            {done.whatsappUrl
              ? "Toque em Finalizar pra avisar a gente no WhatsApp: a mensagem já vai escrita."
              : "Nossa equipe vai conferir tudo e falar com você pelo WhatsApp para fechar o contrato."}
          </Text>
        </Box>
        {done.whatsappUrl && (
          <Button asChild className="w-full">
            <ExternalLink href={done.whatsappUrl} className="text-primary-foreground hover:no-underline">
              Finalizar
            </ExternalLink>
          </Button>
        )}
      </PublicLayout>
    );
  }

  return (
    <PublicLayout companyName={info.data?.companyName}>
      <Box className="space-y-1 text-center">
        <Heading>Pré-cadastro</Heading>
        <Text tone="muted">
          Preencha seus dados e anexe a CNH e o comprovante de residência. Com isso a gente já prepara o seu contrato.
        </Text>
      </Box>
      <Card>
        <CardContent className="pt-6">
          {info.data || info.isError ? (
            <QuestionnaireRegistrationForm
              variant="pre-registration"
              options={info.data?.options ?? { maritalStatus: [], defaultNationality: "Brasileiro(a)" }}
              pending={submit.isPending}
              submitLabel="Enviar pré-cadastro"
              onSubmit={(input) =>
                submit.mutateAsync(input).then((whatsappUrl) => {
                  setDone({ whatsappUrl });
                  window.scrollTo({ top: 0 });
                })
              }
            />
          ) : (
            <PreRegistrationSkeleton />
          )}
        </CardContent>
      </Card>
    </PublicLayout>
  );
}
