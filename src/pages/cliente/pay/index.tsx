import { CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { ExternalLink } from "@/components/atoms/external-link";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { SegmentedField } from "@/components/molecules/segmented-field";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { CheckoutCardForm } from "@/components/organisms/checkout-card-form";
import { CheckoutPixPanel } from "@/components/organisms/checkout-pix-panel";
import { PublicLayout } from "@/components/templates/public-layout";
import { usePublicPay } from "@/hooks/api/cliente/public-pay/usePublicPay";
import type { PublicPayment } from "@/types/payment-link";
import { formatCurrency, formatDate } from "@/utils/format";

const METHODS = [
  { value: "PIX", label: "PIX" },
  { value: "CARD", label: "Cartão de crédito" },
];

function PaySkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-56 w-full" />
      </CardContent>
    </Card>
  );
}

/** "Fale com a locadora" (WhatsApp of the company, when there is one). */
function TalkToUs({ whatsapp }: { whatsapp: string | null }) {
  if (!whatsapp) return null;
  return (
    <Button asChild variant="outline" className="w-full">
      <ExternalLink href={`https://wa.me/${whatsapp}`} className="text-foreground hover:no-underline">
        <MessageCircle />
        Falar com a locadora
      </ExternalLink>
    </Button>
  );
}

function PaymentHeader({ data }: { data: PublicPayment }) {
  return (
    <Box className="space-y-1">
      <Text tone="muted">
        {data.firstName ? `Olá, ${data.firstName}.` : "Olá."} {data.description}
      </Text>
      <Heading>{formatCurrency(data.amount)}</Heading>
    </Box>
  );
}

function OpenPayment({ token, data }: { token: string; data: PublicPayment }) {
  const [method, setMethod] = useState("PIX");
  return (
    <Box className="space-y-5">
      <PaymentHeader data={data} />
      <Text size="sm" tone="muted" className="flex items-center gap-1">
        <Clock className="size-4" />
        Link válido até {formatDate(data.expiresAt)}
      </Text>
      <SegmentedField label="Como você quer pagar?" value={method} options={METHODS} onChange={setMethod} />
      {method === "PIX" ? (
        data.pix ? (
          <CheckoutPixPanel pix={data.pix} />
        ) : (
          <Alert>O PIX não carregou agora. Atualize a página em instantes ou pague no cartão.</Alert>
        )
      ) : (
        <CheckoutCardForm token={token} options={data.cardOptions} blocked={data.cardBlocked} />
      )}
    </Box>
  );
}

/**
 * Public checkout of a rental's outstanding balance (/pagar/:token, no
 * login): PIX or card with the installment interest. The token is the
 * credential; the page shows only the first name, what it is and the amount.
 */
export function PayPage() {
  const { token = "" } = useParams();
  const payment = usePublicPay(token);
  const data = payment.data;

  return (
    <PublicLayout companyName={data?.company.name ?? undefined}>
      {payment.isPending && (
        <SkeletonRegion label="Carregando pagamento…">
          <PaySkeleton />
        </SkeletonRegion>
      )}
      {payment.isError && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            <Heading level={2}>Link indisponível</Heading>
            <Text tone="muted">
              Este link de pagamento não existe ou foi cancelado. Peça um novo à locadora.
            </Text>
          </CardContent>
        </Card>
      )}
      {data && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            {data.state === "OPEN" && <OpenPayment token={token} data={data} />}
            {data.state === "PAID" && (
              <Box className="space-y-3 text-center">
                <CheckCircle2 className="mx-auto size-12 text-success" />
                <Heading level={2}>Pagamento confirmado</Heading>
                <Text tone="muted">
                  {formatCurrency(data.amount)} pago
                  {data.paidMethod === "CREDIT_CARD" ? " no cartão" : " no PIX"}
                  {data.paidAt ? ` em ${formatDate(data.paidAt)}` : ""}. Obrigado!
                </Text>
              </Box>
            )}
            {data.state === "EXPIRED" && (
              <Box className="space-y-3">
                <PaymentHeader data={data} />
                <Alert>
                  Este link venceu em {formatDate(data.expiresAt)}. Fale com a locadora para receber
                  um link novo.
                </Alert>
                <TalkToUs whatsapp={data.company.whatsapp} />
              </Box>
            )}
            {data.state !== "EXPIRED" && <TalkToUs whatsapp={data.company.whatsapp} />}
          </CardContent>
        </Card>
      )}
    </PublicLayout>
  );
}
