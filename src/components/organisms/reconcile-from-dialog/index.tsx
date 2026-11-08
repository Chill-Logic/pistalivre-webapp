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
import { toApiError } from "@/helpers/api-error";
import { useSetReconcileFrom } from "@/hooks/api/gestao/rentals/useBillingMutations";
import { calendarDay } from "@/utils/date";

/**
 * When the rent reconciliation starts counting. Empty = from the first rent
 * charge (useful when what came before was settled outside).
 */
export function ReconcileFromDialog({
  rentalId,
  reconcileFrom,
}: {
  rentalId: string;
  reconcileFrom: string | null;
}) {
  const save = useSetReconcileFrom(rentalId);
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onOpenChange = (next: boolean) => {
    if (save.isPending) return;
    setOpen(next);
    if (!next) return;
    setDay(reconcileFrom ? calendarDay(reconcileFrom) : "");
    setError(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate(day || null, {
      onSuccess: () => setOpen(false),
      onError: (err) => {
        const apiError = toApiError(err);
        setError(apiError.fields?.from ?? apiError.message);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Contar a partir de
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Contar a partir de</DialogTitle>
        <DialogDescription>
          O dia em que o acerto começa: o que veio antes fica fora do devido e
          do pago.{" "}
          {reconcileFrom
            ? "Deixe em branco para voltar a contar da 1ª cobrança de aluguel."
            : "Hoje conta da 1ª cobrança de aluguel."}
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <DateField
            label="Dia"
            placeholder="Da 1ª cobrança de aluguel"
            value={day}
            onChange={(value) => {
              setDay(value);
              setError(null);
            }}
            clearable
          />
          {error && <Alert>{error}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={save.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && (
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
