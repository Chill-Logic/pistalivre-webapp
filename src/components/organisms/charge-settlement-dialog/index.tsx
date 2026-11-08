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
import { useCorrectSettlement } from "@/hooks/api/gestao/charges/useChargeMutations";
import type { Charge } from "@/types/rental";
import { calendarDay, todayInBrasilia } from "@/utils/date";

type Errors = { paidValue?: string; paidAt?: string; form?: string };

/** Fixes the value/date of a MANUAL charge already received (ours only). */
export function ChargeSettlementDialog({ charge }: { charge: Charge }) {
  const correct = useCorrectSettlement(charge.id, charge.rentalId);
  const [open, setOpen] = useState(false);
  const [paidValue, setPaidValue] = useState<number | null>(null);
  const [paidAt, setPaidAt] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const onOpenChange = (next: boolean) => {
    if (correct.isPending) return;
    setOpen(next);
    if (!next) return;
    setPaidValue(charge.paidValue);
    setPaidAt(charge.paidAt ? calendarDay(charge.paidAt) : todayInBrasilia());
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
    correct.mutate(
      { paidValue, paidAt },
      {
        onSuccess: () => setOpen(false),
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
        <Button variant="ghost" size="sm">
          <Pencil />
          Corrigir recebimento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Corrigir recebimento</DialogTitle>
        <DialogDescription>
          Só vale para lançamentos fora do Asaas: o que o cliente pagou e
          quando.
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
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={correct.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={correct.isPending}>
              {correct.isPending && (
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
