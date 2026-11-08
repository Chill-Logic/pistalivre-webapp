import { Link2 } from "lucide-react";
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
import { SelectField } from "@/components/molecules/select-field";
import { toApiError } from "@/helpers/api-error";
import { useLinkCharge } from "@/hooks/api/gestao/charges/useStandaloneChargeMutations";
import type { AsaasCharge } from "@/types/asaas-charge";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type AsaasChargeLinkDialogProps = {
  charge: AsaasCharge;
  rentals: { id: string; code: string }[];
};

/**
 * Ties a charge made outside the system to one of the customer's rentals
 * (written at Asaas as its external reference). Our copy arrives on the
 * next sync.
 */
export function AsaasChargeLinkDialog({
  charge,
  rentals,
}: AsaasChargeLinkDialogProps) {
  const link = useLinkCharge();
  const [open, setOpen] = useState(false);
  const [rentalId, setRentalId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onOpenChange = (next: boolean) => {
    if (link.isPending) return;
    setOpen(next);
    if (!next) return;
    setRentalId(rentals.length === 1 ? rentals[0].id : "");
    setError(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!rentalId) {
      setError("Escolha a locação");
      return;
    }
    link.mutate(
      { chargeId: charge.id, rentalId },
      {
        onSuccess: () => setOpen(false),
        onError: (err) => {
          const apiError = toApiError(err);
          setError(apiError.fields?.rentalId ?? apiError.message);
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
          disabled={rentals.length === 0}
          aria-label={`Vincular à locação a cobrança de ${formatCalendarDate(charge.dueDate)}`}
        >
          <Link2 />
          Vincular à locação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Vincular à locação</DialogTitle>
        <DialogDescription>
          {charge.description ?? "Cobrança"} · {formatCurrency(charge.value)} ·
          vence {formatCalendarDate(charge.dueDate)}. Ela passa a aparecer na
          ficha da locação na próxima sincronização com o Asaas.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <SelectField
            label="Locação"
            value={rentalId}
            options={rentals.map((rental) => ({
              value: rental.id,
              label: rental.code,
            }))}
            onChange={(value) => {
              setRentalId(value);
              setError(null);
            }}
            placeholder="Escolha a locação"
            error={error ?? undefined}
            disabled={link.isPending}
          />
          {error && !rentalId && <Alert>{error}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={link.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={link.isPending}>
              {link.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Vincular
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
