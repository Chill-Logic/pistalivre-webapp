import { Ban, MessageCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { ExternalLink } from "@/components/atoms/external-link";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { CopyCode } from "@/components/molecules/copy-code";
import { PaymentLinkDialog } from "@/components/organisms/payment-link-dialog";
import {
  PAYMENT_LINK_STATE_BADGE,
  PAYMENT_LINK_STATE_LABEL,
  groupedChargeLine,
  paymentLinkMessage,
  paymentLinkPaidLabel,
  whatsappShareUrl,
} from "@/helpers/payment-link";
import {
  useCancelPaymentLink,
  useRenewPaymentLink,
  useRentalPaymentLinks,
} from "@/hooks/api/gestao/payment-links/usePaymentLinks";
import type { PaymentLink } from "@/types/payment-link";
import { formatCurrency, formatDate } from "@/utils/format";

/** The open (or expired) link: copy, WhatsApp, renew, cancel. */
function LiveLink({ link }: { link: PaymentLink }) {
  const renew = useRenewPaymentLink();
  const cancel = useCancelPaymentLink();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const expired = link.state === "EXPIRED";

  return (
    <Box className="space-y-3">
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <Text weight="medium">{formatCurrency(link.amount)}</Text>
        <Badge variant={PAYMENT_LINK_STATE_BADGE[link.state]}>
          {PAYMENT_LINK_STATE_LABEL[link.state]}
        </Badge>
      </Box>
      <Text size="xs" tone={expired ? "destructive" : "muted"}>
        {expired ? "Venceu em " : "Vale até "}
        {formatDate(link.expiresAt)}
        {link.renewCount > 0 && ` · renovado ${link.renewCount}×`}
      </Text>
      <CopyCode code={link.url} copied="Link copiado" />
      <Box className="flex flex-wrap gap-2">
        {!expired && (
          <Button asChild size="sm" variant="outline">
            <ExternalLink
              href={whatsappShareUrl(paymentLinkMessage(link))}
              className="text-foreground hover:no-underline"
            >
              <MessageCircle />
              WhatsApp
            </ExternalLink>
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={renew.isPending}
          onClick={() => renew.mutate(link.id)}
        >
          {renew.isPending ? <Spinner /> : <RefreshCw />}
          Renovar 7 dias
        </Button>
        <ConfirmDialog
          destructive
          open={confirmCancel}
          onOpenChange={setConfirmCancel}
          trigger={
            <Button size="sm" variant="ghost" className="text-destructive">
              <Ban />
              Cancelar
            </Button>
          }
          title="Cancelar o link?"
          description="O PIX do link é removido e o link para de funcionar. O saldo continua devido na locação; as cobranças agrupadas não voltam."
          confirmLabel="Cancelar link"
          onConfirm={() => cancel.mutate(link.id, { onSettled: () => setConfirmCancel(false) })}
        />
      </Box>
      {link.groupedCharges.length > 0 && (
        <Text size="xs" tone="muted">
          Agrupou {link.groupedCharges.length} cobrança
          {link.groupedCharges.length > 1 ? "s" : ""}:{" "}
          {link.groupedCharges.map(groupedChargeLine).join("; ")}
        </Text>
      )}
    </Box>
  );
}

/** A closed link (paid or canceled), one line in the history. */
function PastLink({ link }: { link: PaymentLink }) {
  return (
    <Box className="flex flex-wrap items-center justify-between gap-2">
      <Box className="min-w-0">
        <Text size="sm">{formatCurrency(link.amount)}</Text>
        <Text size="xs" tone="muted">
          {paymentLinkPaidLabel(link) ??
            `Gerado em ${formatDate(link.createdAt)}${link.canceledAt ? ` · cancelado em ${formatDate(link.canceledAt)}` : ""}`}
        </Text>
      </Box>
      <Badge variant={PAYMENT_LINK_STATE_BADGE[link.state]}>
        {PAYMENT_LINK_STATE_LABEL[link.state]}
      </Badge>
    </Box>
  );
}

/**
 * "Cobrança do saldo": the public payment link of what the rental owes (PIX or
 * card). Shows nothing while there is no balance and no link ever made.
 */
export function RentalPaymentLinksCard({ rentalId }: { rentalId: string }) {
  const links = useRentalPaymentLinks(rentalId);
  const data = links.data;
  if (links.isPending) return <RentalPaymentLinksCardSkeleton />;
  if (!data) return null;
  const live = data.items.find((l) => l.state === "OPEN" || l.state === "EXPIRED") ?? null;
  const past = data.items.filter((l) => l !== live);
  if (!live && past.length === 0 && data.balance <= 0) return null;

  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Cobrança do saldo</CardTitle>
          {!live && data.balance > 0 && (
            <PaymentLinkDialog rentalId={rentalId} balance={data.balance} charges={data.charges} />
          )}
        </Box>
      </CardHeader>
      <CardContent className="space-y-4">
        {live ? (
          <LiveLink link={live} />
        ) : (
          data.balance > 0 && (
            <Text size="sm" tone="muted">
              Saldo devedor de {formatCurrency(data.balance)}. Gere um link para o cliente pagar por
              PIX ou cartão.
            </Text>
          )
        )}
        {past.length > 0 && (
          <List className="divide-y rounded-md border">
            {past.map((link) => (
              <ListItem key={link.id} className="px-3 py-2">
                <PastLink link={link} />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export function RentalPaymentLinksCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-40 text-base" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
