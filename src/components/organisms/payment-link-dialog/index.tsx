import { HandCoins, MessageCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { ExternalLink } from "@/components/atoms/external-link";
import { Form } from "@/components/atoms/form";
import { List, ListItem } from "@/components/atoms/list";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CopyCode } from "@/components/molecules/copy-code";
import { MoneyField } from "@/components/molecules/money-field";
import { toApiError } from "@/helpers/api-error";
import {
  groupedChargeLine,
  paymentLinkMessage,
  whatsappShareUrl,
} from "@/helpers/payment-link";
import { useCreatePaymentLink } from "@/hooks/api/gestao/payment-links/usePaymentLinks";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import type { GroupedCharge, PaymentLink } from "@/types/payment-link";
import { formatCurrency, formatDate } from "@/utils/format";

type PaymentLinkDialogProps = {
  rentalId: string;
  balance: number;
  charges: GroupedCharge[];
};

/**
 * "Cobrar o saldo devedor": confirms the amount (the server's balance by
 * default) and what gets grouped, then hands over the link and the WhatsApp
 * message. The confirmation says what happens to the grouped charges.
 */
export function PaymentLinkDialog({ rentalId, balance, charges }: PaymentLinkDialogProps) {
  const create = useCreatePaymentLink(rentalId);
  const idempotency = useIdempotencyKey();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(balance);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<PaymentLink | null>(null);

  const onOpenChange = (next: boolean) => {
    if (create.isPending) return;
    setOpen(next);
    if (!next) return;
    setAmount(balance);
    setError(null);
    setCreated(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!amount || amount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }
    create.mutate(
      { amount: amount === balance ? null : amount, key: idempotency.key },
      {
        onSuccess: (link) => {
          idempotency.renew();
          setCreated(link);
        },
        onError: (err) => setError(toApiError(err).message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <HandCoins />
          Cobrar o saldo devedor
        </Button>
      </DialogTrigger>
      <DialogContent>
        {created ? (
          <>
            <DialogTitle>Link gerado</DialogTitle>
            <DialogDescription>
              {formatCurrency(created.amount)} · vale até {formatDate(created.expiresAt)}. O cliente
              abre sem login e paga por PIX ou cartão.
            </DialogDescription>
            <Box className="space-y-3">
              <CopyCode code={created.url} copied="Link copiado" />
              <Button asChild className="w-full">
                <ExternalLink
                  href={whatsappShareUrl(paymentLinkMessage(created))}
                  className="text-primary-foreground hover:no-underline"
                >
                  <MessageCircle />
                  Mandar no WhatsApp
                </ExternalLink>
              </Button>
            </Box>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogTitle>Cobrar o saldo devedor</DialogTitle>
            <DialogDescription>
              Gera um link de pagamento (PIX ou cartão em até 12×, com os juros do parcelamento por
              conta do cliente) que vale 7 dias.
            </DialogDescription>
            <Form onSubmit={onSubmit} noValidate className="space-y-4">
              <MoneyField
                label="Valor"
                value={amount}
                onChange={(value) => {
                  setAmount(value);
                  setError(null);
                }}
              />
              <Text size="xs" tone="muted">
                Saldo devedor do sistema: {formatCurrency(balance)}.
              </Text>
              <Box className="space-y-1">
                <Text size="sm" weight="medium">
                  {charges.length > 0
                    ? `Agrupa ${charges.length} cobrança${charges.length > 1 ? "s" : ""} em aberto`
                    : "Nenhuma cobrança em aberto para agrupar"}
                </Text>
                {charges.length > 0 && (
                  <>
                    <Text size="xs" tone="muted">
                      Elas são removidas no Asaas (dá para restaurar lá, e os avisos delas param) e
                      ficam listadas no link.
                    </Text>
                    <List className="max-h-32 overflow-y-auto text-xs text-muted-foreground">
                      {charges.map((charge) => (
                        <ListItem key={charge.paymentId}>{groupedChargeLine(charge)}</ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
              {error && <Alert>{error}</Alert>}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={create.isPending}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending && <Spinner className="text-primary-foreground" />}
                  Gerar link
                </Button>
              </DialogFooter>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
