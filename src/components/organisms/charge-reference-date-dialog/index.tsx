import { CalendarClock } from "lucide-react";
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
import { useChargeReferenceDate } from "@/hooks/api/gestao/charges/useChargeMutations";
import type { Charge } from "@/types/rental";
import { calendarDay } from "@/utils/date";

/**
 * "Referente a": the day a rent charge is about, when it is not its due
 * date (e.g. the holiday's daily rent reissued to the next day). Works even
 * after it is paid; the same day as the due date clears it.
 */
export function ChargeReferenceDateDialog({ charge }: { charge: Charge }) {
  const save = useChargeReferenceDate(charge.id, charge.rentalId);
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onOpenChange = (next: boolean) => {
    if (save.isPending) return;
    setOpen(next);
    if (!next) return;
    setDay(charge.referenceDate ? calendarDay(charge.referenceDate) : "");
    setError(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate(day || null, {
      onSuccess: () => setOpen(false),
      onError: (err) => {
        const apiError = toApiError(err);
        setError(apiError.fields?.referenceDate ?? apiError.message);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <CalendarClock />
          Referente a
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>De que dia é esta cobrança?</DialogTitle>
        <DialogDescription>
          Use quando o aluguel cobra outro dia que não o do vencimento. Vazio =
          o próprio vencimento.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <DateField
            label="Referente a"
            placeholder="O mesmo do vencimento"
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
