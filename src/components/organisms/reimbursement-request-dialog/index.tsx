import { HandCoins } from "lucide-react";
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
import { Form } from "@/components/atoms/form";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { FilePicker } from "@/components/molecules/file-picker";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { useMyWallet } from "@/hooks/api/cliente/finance/useMyWallet";
import { useRequestReimbursement } from "@/hooks/api/cliente/finance/useRequestReimbursement";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PortalRental } from "@/types/portal";
import { formatCurrency } from "@/utils/format";

type ReimbursementRequestDialogProps = {
  /** Fixed on the rental page; on the home the renter picks one. */
  rentalId?: string;
  /** Rentals that can ask (active), when there is no fixed one. */
  rentals?: PortalRental[];
  maintenanceId?: string;
  /** With a maintenance: its cost, locked (the API ignores any other). */
  fixedAmount?: number;
  defaultReason?: string;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline";
};

type Errors = {
  rentalId?: string;
  walletMethodId?: string;
  amount?: string;
  reason?: string;
  form?: string;
};

/**
 * The renter asks to be paid back for something of the vehicle. The pix
 * goes to a key of the wallet (already checked in the bank). The rental
 * company reviews it and sends the pix itself, outside the system.
 */
export function ReimbursementRequestDialog({
  rentalId,
  rentals = [],
  maintenanceId,
  fixedAmount,
  defaultReason = "",
  triggerLabel = "Pedir reembolso",
  triggerVariant = "outline",
}: ReimbursementRequestDialogProps) {
  const { label } = useLabels();
  const wallet = useMyWallet();
  const request = useRequestReimbursement();
  const keys = wallet.data ?? [];
  const locked = fixedAmount !== undefined;

  const [open, setOpen] = useState(false);
  const [pickedRental, setPickedRental] = useState("");
  const [walletMethodId, setWalletMethodId] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [receipts, setReceipts] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  const effectiveRental = rentalId ?? pickedRental;
  const selectedKey = keys.find((key) => key.id === walletMethodId);

  const onOpenChange = (next: boolean) => {
    if (request.isPending) return;
    setOpen(next);
    if (!next) return;
    setPickedRental(rentals.length === 1 ? rentals[0].id : "");
    setWalletMethodId((keys.find((key) => key.isDefault) ?? keys[0])?.id ?? "");
    setAmount(null);
    setReason(defaultReason);
    setReceipts([]);
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!effectiveRental) next.rentalId = "Escolha a locação";
    if (!walletMethodId) next.walletMethodId = "Escolha a chave pix";
    if (!locked && (!amount || amount <= 0)) next.amount = "Informe o valor";
    if (!reason.trim()) next.reason = "Explique o motivo do reembolso";
    setErrors(next);
    if (Object.keys(next).length) return;

    request.mutate(
      {
        rentalId: effectiveRental,
        walletMethodId,
        reason: reason.trim(),
        amount: locked ? undefined : (amount ?? undefined),
        maintenanceId,
        receipts,
      },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          const placed =
            fields.rentalId ||
            fields.walletMethodId ||
            fields.amount ||
            fields.reason;
          setErrors({
            rentalId: fields.rentalId,
            walletMethodId: fields.walletMethodId,
            amount: fields.amount,
            reason: fields.reason,
            form: placed ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant={triggerVariant}>
          <HandCoins />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{triggerLabel}</DialogTitle>
        <DialogDescription>
          A locadora analisa o pedido e, se aprovar, faz o pix para a chave da
          sua carteira.
        </DialogDescription>
        {wallet.isSuccess && keys.length === 0 ? (
          <Alert variant="info">
            Você ainda não tem uma chave pix. Em “Minha carteira”, na página
            inicial, adicione uma e depois volte aqui.
          </Alert>
        ) : (
          <Form onSubmit={onSubmit} noValidate className="space-y-4">
            {!rentalId && rentals.length > 1 && (
              <SelectField
                label="Locação"
                value={pickedRental}
                placeholder="Escolha a locação"
                options={rentals.map((rental) => ({
                  value: rental.id,
                  label: `${rental.code} · ${rental.vehicle.plate}`,
                }))}
                onChange={setPickedRental}
                error={errors.rentalId}
                disabled={request.isPending}
              />
            )}
            {locked ? (
              <Box className="space-y-1">
                <Text weight="medium">Valor</Text>
                <Text size="base" weight="semibold" className="tabular-nums">
                  {formatCurrency(fixedAmount)}
                </Text>
                <Text size="xs" tone="muted">
                  O valor da manutenção registrada.
                </Text>
              </Box>
            ) : (
              <MoneyField
                label="Valor"
                value={amount}
                onChange={setAmount}
                error={errors.amount}
              />
            )}
            <SelectField
              label="Chave pix (destino)"
              value={walletMethodId}
              placeholder={
                wallet.isPending ? "Carregando chaves…" : "Escolha a chave"
              }
              options={keys.map((key) => ({
                value: key.id,
                label: `${key.ownerName ?? "Chave"} · ${label(LABEL_MAPS.pixKeyType, key.pixKeyType)}`,
              }))}
              onChange={setWalletMethodId}
              error={errors.walletMethodId}
              disabled={request.isPending || wallet.isPending}
            />
            {selectedKey && (
              <Text size="xs" tone="muted" className="break-all">
                Vai para: {selectedKey.ownerName}
                {selectedKey.bank && ` — ${selectedKey.bank}`} ·{" "}
                {selectedKey.pixKey}
              </Text>
            )}
            <TextareaField
              label="Motivo"
              placeholder="Explique por que está pedindo o reembolso"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              error={errors.reason}
              disabled={request.isPending}
            />
            <Box className="space-y-1">
              <FilePicker
                label="Anexar recibo"
                files={receipts}
                onChange={setReceipts}
              />
              <Text size="xs" tone="muted">
                Opcional: foto ou arquivo do recibo ajuda a aprovar mais rápido.
              </Text>
            </Box>
            {errors.form && <Alert>{errors.form}</Alert>}
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={request.isPending}
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={request.isPending}>
                {request.isPending && (
                  <Spinner className="text-primary-foreground" />
                )}
                Enviar pedido
              </Button>
            </DialogFooter>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
