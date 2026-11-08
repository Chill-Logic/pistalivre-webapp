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
import { DateField } from "@/components/molecules/date-field";
import { MoneyField } from "@/components/molecules/money-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useAddCustomerDebtPayment } from "@/hooks/api/gestao/customer-debts/useCustomerDebts";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import type { CustomerDebt } from "@/types/customer-debt";
import { todayInBrasilia } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

type Errors = { amount?: string; paidAt?: string; form?: string };

/** A direct payment (cash, pix to the company) on a customer debt. */
export function CustomerDebtPaymentDialog({
  customerId,
  debt,
}: {
  customerId: string;
  debt: CustomerDebt;
}) {
  const add = useAddCustomerDebtPayment(customerId, debt.id);
  const idempotency = useIdempotencyKey();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [paidAt, setPaidAt] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const onOpenChange = (next: boolean) => {
    if (add.isPending) return;
    setOpen(next);
    if (!next) return;
    setAmount(debt.balance);
    setPaidAt(todayInBrasilia());
    setNotes("");
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!amount || amount <= 0) next.amount = "Informe o valor pago";
    if (!paidAt) next.paidAt = "Informe a data do pagamento";
    else if (paidAt > todayInBrasilia())
      next.paidAt = "A data não pode ser no futuro";
    setErrors(next);
    if (Object.keys(next).length > 0 || !amount) return;
    add.mutate(
      {
        key: idempotency.key,
        input: { amount, paidAt, notes: notes.trim() || null },
      },
      {
        onSuccess: () => {
          idempotency.renew();
          setOpen(false);
        },
        onError: (error) => {
          const fields = toApiError(error).fields ?? {};
          setErrors({
            amount: fields.amount,
            paidAt: fields.paidAt,
            form:
              fields.amount || fields.paidAt
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
        <Button variant="outline" size="sm">
          <HandCoins />
          Registrar pagamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Pagamento à vista</DialogTitle>
        <DialogDescription>
          O que o cliente pagou direto neste débito. Falta{" "}
          {formatCurrency(debt.balance)}.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <MoneyField
            label="Valor pago"
            value={amount}
            onChange={(value) => {
              setAmount(value);
              setErrors({});
            }}
            error={errors.amount}
          />
          <DateField
            label="Data do pagamento"
            value={paidAt}
            onChange={(value) => {
              setPaidAt(value);
              setErrors({});
            }}
            error={errors.paidAt}
          />
          <TextareaField
            label="Observação (opcional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={add.isPending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={add.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={add.isPending}>
              {add.isPending && <Spinner className="text-primary-foreground" />}
              Registrar pagamento
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
