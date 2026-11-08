import { Pencil } from "lucide-react";
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
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useUpdateCharge } from "@/hooks/api/gestao/charges/useChargeMutations";
import type { Charge } from "@/types/rental";
import { calendarDay } from "@/utils/date";
import { formatCalendarDate } from "@/utils/format";

type Errors = { amount?: string; dueDate?: string; form?: string };

/** Amount and due date of an OPEN charge, on both sides (Asaas and here). */
export function ChargeEditDialog({ charge }: { charge: Charge }) {
  const update = useUpdateCharge(charge.id, charge.rentalId);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(charge.amount);
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const onOpenChange = (next: boolean) => {
    if (update.isPending) return;
    setOpen(next);
    if (!next) return;
    setAmount(charge.amount);
    setDueDate(calendarDay(charge.dueDate));
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!amount || amount <= 0) next.amount = "Informe o valor";
    if (!dueDate) next.dueDate = "Informe o vencimento";
    setErrors(next);
    if (Object.keys(next).length > 0 || !amount) return;
    update.mutate(
      { amount, dueDate },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const fields = toApiError(error).fields ?? {};
          setErrors({
            amount: fields.amount,
            dueDate: fields.dueDate,
            form:
              fields.amount || fields.dueDate
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
          variant="ghost"
          size="sm"
          aria-label={`Editar cobrança de ${formatCalendarDate(charge.dueDate)}`}
        >
          <Pencil />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Editar cobrança</DialogTitle>
        <DialogDescription>
          Muda o valor original e o vencimento
          {charge.channel === "asaas" ? " no Asaas também" : ""}. Multa e juros
          são recalculados a partir daí.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <MoneyField
            label="Valor"
            value={amount}
            onChange={(value) => {
              setAmount(value);
              setErrors({});
            }}
            error={errors.amount}
          />
          <DateField
            label="Vencimento"
            value={dueDate}
            onChange={(value) => {
              setDueDate(value);
              setErrors({});
            }}
            error={errors.dueDate}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={update.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
