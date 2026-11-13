import { FileCheck2, IdCard, Home, MessageCircle, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { ExternalLink } from "@/components/atoms/external-link";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { List, ListItem, OrderedList } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { QuestionnaireRegistrationForm } from "@/components/organisms/questionnaire-registration-form";
import { PublicLayout } from "@/components/templates/public-layout";
import { usePreRegistration } from "@/hooks/api/cliente/public-lead/usePreRegistration";

/** What to have at hand before starting (the side panel). */
const NEEDED = [
  { icon: IdCard, title: "CNH", text: "Foto legível (frente e verso) ou o PDF da CNH digital, dentro da validade." },
  { icon: Home, title: "Comprovante de residência", text: "Conta de luz, água, gás, internet ou telefone, de preferência dos últimos 3 meses." },
  { icon: UserRoundCheck, title: "Seus dados", text: "CPF, data de nascimento, estado civil, profissão, e-mail, telefone e endereço." },
];

/** What happens after sending. */
const NEXT = [
  "A gente confere seus dados e documentos.",
  "Preparamos o contrato da locação.",
  "Você assina pelo celular e combina a retirada da moto.",
];

/** The form's shape while the options load. */
function PreRegistrationSkeleton() {
  return (
    <Box className="space-y-6">
      {[0, 1, 2].map((block) => (
        <Box key={block} className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Row className="gap-y-3">
            <Col lg={8}>
              <Skeleton className="h-10 w-full" />
            </Col>
            <Col lg={4}>
              <Skeleton className="h-10 w-full" />
            </Col>
          </Row>
        </Box>
      ))}
      <Skeleton className="h-11 w-full lg:ml-auto lg:w-64" />
    </Box>
  );
}

/** Left on the desktop (sticky), on top on the phone: what to have and what comes next. */
function PreRegistrationGuide() {
  return (
    <Box className="space-y-6 lg:sticky lg:top-6">
      <Box className="space-y-2">
        <Heading>Pré-cadastro</Heading>
        <Text tone="muted">
          Preencha seus dados e anexe os documentos. Com isso a gente já prepara o seu contrato.
        </Text>
      </Box>
      <Card>
        <CardContent className="space-y-4 pt-4 md:pt-6">
          <Text weight="medium">Tenha em mãos</Text>
          <List className="space-y-4">
            {NEEDED.map(({ icon: Icon, title, text }) => (
              <ListItem key={title} className="flex gap-3">
                <Box className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden />
                </Box>
                <Box className="min-w-0">
                  <Text size="sm" weight="medium">
                    {title}
                  </Text>
                  <Text size="sm" tone="muted">
                    {text}
                  </Text>
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      <Box className="hidden space-y-3 lg:block">
        <Text weight="medium">Depois de enviar</Text>
        <OrderedList className="space-y-2">
          {NEXT.map((step, index) => (
            <ListItem key={step} className="flex gap-3">
              <Text inline size="sm" weight="medium" className="flex size-6 shrink-0 items-center justify-center rounded-full border tabular-nums">
                {index + 1}
              </Text>
              <Text size="sm" tone="muted">
                {step}
              </Text>
            </ListItem>
          ))}
        </OrderedList>
      </Box>
    </Box>
  );
}

/**
 * /pre-cadastro (no login): the customer sends, in one go, everything the
 * team needs to register them and generate the rental contract — data and
 * documents (CNH + proof of address required). On the desktop: the guide on
 * the left, the form across the rest; on the phone, one column. Ends on
 * WhatsApp when the company has a number configured.
 */
export function PreRegistrationPage() {
  const { info, submit } = usePreRegistration();
  const [done, setDone] = useState<{ whatsappUrl: string | null } | null>(null);

  if (done) {
    return (
      <PublicLayout companyName={info.data?.companyName}>
        <Card>
          <CardContent className="space-y-4 pt-6 text-center md:pt-8">
            <Box className="mx-auto flex size-12 items-center justify-center rounded-full bg-success text-success-foreground">
              <FileCheck2 className="size-6" aria-hidden />
            </Box>
            <Heading>Recebemos seus dados</Heading>
            <Text tone="muted">
              {done.whatsappUrl
                ? "Toque em Finalizar pra avisar a gente no WhatsApp: a mensagem já vai escrita."
                : "Nossa equipe vai conferir tudo e falar com você pelo WhatsApp para fechar o contrato."}
            </Text>
            {done.whatsappUrl && (
              <Button asChild className="w-full">
                <ExternalLink href={done.whatsappUrl} className="text-primary-foreground hover:no-underline">
                  <MessageCircle className="size-4" aria-hidden />
                  Finalizar
                </ExternalLink>
              </Button>
            )}
          </CardContent>
        </Card>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout companyName={info.data?.companyName} width="wide">
      <Row className="gap-y-6">
        <Col lg={4}>
          <PreRegistrationGuide />
        </Col>
        <Col lg={8}>
          <Card>
            <CardContent className="pt-4 md:pt-6">
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
        </Col>
      </Row>
    </PublicLayout>
  );
}
