import { HandCoins } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/atoms/alert";
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
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DateField } from "@/components/molecules/date-field";
import { MoneyField } from "@/components/molecules/money-field";
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useSettleCharge } from "@/hooks/api/gestao/charges/useChargeMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import type { Charge } from "@/types/rental";
import { todayInBrasilia } from "@/utils/date";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type Errors = { paidValue?: string; paidAt?: string; form?: string };

/**
 * What settling needs from a charge: a rental's charge or an item of the
 * Financeiro's "A receber" queue both have it.
 */
export type SettleableCharge = Pick<
  Charge,
  "id" | "rentalId" | "channel" | "amounts" | "dueDate"
>;

/**
 * "Dar baixa": the customer paid outside the gateway (cash, pix to the
 * bank). At Asaas the charge becomes "received in cash", so it stops
 * charging. The original amount/due date stay; the difference shows as
 * shortfall or lateness.
 */
export function ChargeSettleDialog({ charge }: { charge: SettleableCharge }) {
  const settle = useSettleCharge(charge.id, charge.rentalId);
  const idempotency = useIdempotencyKey();
  const atAsaas = charge.channel === "asaas";
  const [open, setOpen] = useState(false);
  const [paidValue, setPaidValue] = useState<number | null>(null);
  const [paidAt, setPaidAt] = useState("");
  const [notify, setNotify] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const onOpenChange = (next: boolean) => {
    if (settle.isPending) return;
    setOpen(next);
    if (!next) return;
    setPaidValue(charge.amounts.amount);
    setPaidAt(todayInBrasilia());
    setNotify(false);
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!paidValue || paidValue <= 0)
      next.paidValue = "Informe o valor recebido";
    if (!paidAt) next.paidAt = "Informe a data do recebimento";
    else if (paidAt > todayInBrasilia())
      next.paidAt = "A data não pode ser no futuro";
    setErrors(next);
    if (Object.keys(next).length > 0 || !paidValue) return;
    settle.mutate(
      {
        key: idempotency.key,
        input: {
          paidValue,
          paidAt,
          ...(atAsaas ? { notifyCustomer: notify } : {}),
        },
      },
      {
        onSuccess: () => {
          idempotency.renew();
          setOpen(false);
        },
        onError: (error) => {
          const fields = toApiError(error).fields ?? {};
          setErrors({
            paidValue: fields.paidValue,
            paidAt: fields.paidAt,
            form:
              fields.paidValue || fields.paidAt
                ? undefined
                : moneyErrorMessage(error),
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={`Dar baixa na cobrança de ${formatCalendarDate(charge.dueDate)}`}
        >
          <HandCoins />
          Dar baixa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Dar baixa</DialogTitle>
        <DialogDescription>
          Registre o que o cliente pagou por fora. Devido hoje:{" "}
          {formatCurrency(charge.amounts.amount)}.
          {atAsaas &&
            " No Asaas ela vira “recebida em dinheiro” e para de cobrar."}
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <MoneyField
            label="Valor recebido"
            value={paidValue}
            onChange={(value) => {
              setPaidValue(value);
              setErrors({});
            }}
            error={errors.paidValue}
          />
          <DateField
            label="Data do recebimento"
            value={paidAt}
            onChange={(value) => {
              setPaidAt(value);
              setErrors({});
            }}
            error={errors.paidAt}
          />
          {atAsaas && (
            <CheckboxField
              label="Avisar o cliente pelo Asaas"
              checked={notify}
              onChange={setNotify}
              disabled={settle.isPending}
            />
          )}
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={settle.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={settle.isPending}>
              {settle.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Dar baixa
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
