import { Link2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { ExternalLink } from "@/components/atoms/external-link";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { CopyCode } from "@/components/molecules/copy-code";
import { toApiError } from "@/helpers/api-error";
import { whatsappShareUrl } from "@/helpers/payment-link";
import {
  useChargeAcceptsCard,
  useChargePayLink,
} from "@/hooks/api/gestao/charges/useChargeMutations";
import type { Charge } from "@/types/rental";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/**
 * "Link de pagamento" of ONE charge (open, in Asaas): the public checkout
 * (no login), created on first open and the same afterwards. The card is a
 * choice of the charge (off by default), switched right here.
 */
export function ChargePayLinkDialog({ charge }: { charge: Charge }) {
  const payLink = useChargePayLink(charge.id);
  const acceptsCard = useChargeAcceptsCard(charge.id, charge.rentalId);
  const [open, setOpen] = useState(false);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && !payLink.data) payLink.mutate();
  };

  const message = payLink.data
    ? [
        `Olá! Segue o link para pagar a cobrança de ${formatCurrency(charge.amounts.amount)} (vence ${formatCalendarDate(charge.dueDate)}).`,
        charge.acceptsCard
          ? "Dá para pagar por PIX ou no cartão."
          : "O pagamento é por PIX.",
        payLink.data.url,
      ].join("\n")
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Link2 />
          Link de pagamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Link de pagamento</DialogTitle>
        <DialogDescription>
          O cliente abre sem login e paga esta cobrança. O link não vence: vale
          enquanto ela estiver em aberto.
        </DialogDescription>
        <Box className="space-y-4">
          {payLink.isPending && <Skeleton className="h-10 w-full" />}
          {payLink.isError && (
            <Alert>{toApiError(payLink.error).message}</Alert>
          )}
          {payLink.data && (
            <>
              <CopyCode code={payLink.data.url} copied="Link copiado" />
              <Button asChild className="w-full">
                <ExternalLink
                  href={whatsappShareUrl(message)}
                  className="text-primary-foreground hover:no-underline"
                >
                  <MessageCircle />
                  Mandar no WhatsApp
                </ExternalLink>
              </Button>
            </>
          )}
          <CheckboxField
            label="Aceita cartão"
            checked={charge.acceptsCard}
            disabled={acceptsCard.isPending}
            onChange={(checked) => acceptsCard.mutate({ acceptsCard: checked })}
          />
          {charge.acceptsCard && (
            <CheckboxField
              label="Aceitar parcelamento"
              hint="Juros do parcelamento por conta do cliente. Sem marcar, só cartão à vista."
              checked={charge.cardInstallments}
              disabled={acceptsCard.isPending}
              onChange={(checked) =>
                acceptsCard.mutate({
                  acceptsCard: true,
                  cardInstallments: checked,
                })
              }
            />
          )}
          {acceptsCard.isError && (
            <Text size="sm" tone="destructive">
              {toApiError(acceptsCard.error).message}
            </Text>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
