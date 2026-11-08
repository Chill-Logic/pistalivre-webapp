import { Plus } from "lucide-react";
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
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useAddRentReceipt } from "@/hooks/api/gestao/rentals/useBillingMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { todayInBrasilia } from "@/utils/date";

type Errors = { amount?: string; receivedAt?: string; form?: string };

/**
 * A pix that landed in OUR account for this rental (just value and day, as
 * in the bank statement). The server spreads it over the open rent, oldest
 * first; what is left becomes credit for the next charge.
 */
export function RentReceiptDialog({ rentalId }: { rentalId: string }) {
  const add = useAddRentReceipt(rentalId);
  const idempotency = useIdempotencyKey();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [receivedAt, setReceivedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const onOpenChange = (next: boolean) => {
    if (add.isPending) return;
    setOpen(next);
    if (!next) return;
    setAmount(null);
    setReceivedAt(todayInBrasilia());
    setNotes("");
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!amount || amount <= 0) next.amount = "Informe o valor";
    if (!receivedAt) next.receivedAt = "Informe o dia";
    else if (receivedAt > todayInBrasilia())
      next.receivedAt = "O dia não pode ser no futuro";
    setErrors(next);
    if (Object.keys(next).length > 0 || !amount) return;
    add.mutate(
      {
        key: idempotency.key,
        input: {
          amount,
          receivedAt,
          ...(notes.trim() ? { notes: notes.trim() } : {}),
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
            amount: fields.amount,
            receivedAt: fields.receivedAt,
            form:
              fields.amount || fields.receivedAt
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
          <Plus />
          Registrar pix
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Registrar pix recebido</DialogTitle>
        <DialogDescription>
          O pix que caiu na nossa conta, como no extrato do banco. Ele paga o
          aluguel em aberto, do mais antigo para a frente; a sobra vira crédito.
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
            label="Dia em que caiu"
            value={receivedAt}
            onChange={(value) => {
              setReceivedAt(value);
              setErrors({});
            }}
            error={errors.receivedAt}
          />
          <FormField
            label="Observação (opcional)"
            placeholder="Ex.: pix do João, id E123…"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
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
              Registrar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
