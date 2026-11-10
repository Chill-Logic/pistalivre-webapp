import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
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
import { MoneyField } from "@/components/molecules/money-field";
import type { Currency } from "@/types/currency";
import {
  RemoteCombobox,
  type RemoteOption,
} from "@/components/molecules/remote-combobox";
import { toApiError } from "@/helpers/api-error";
import { useSupplierVehicles } from "@/hooks/api/gestao/suppliers/useSupplierVehicles";
import { useVehicleOptions } from "@/hooks/ui/useRemoteOptions";

type SupplierVehicleDialogProps = {
  supplierId: string;
  trigger: ReactNode;
  /** Suggested amount for a new link (the supplier's base amount). */
  defaultAmount: number;
  /** The supplier's currency (the amount is in it). */
  currency: Currency;
  /** Already linked: hidden from the picker. */
  linkedVehicleIds: string[];
  /** Editing the amount of this linked vehicle (no picker). */
  vehicle?: { id: string; label: string; monthlyAmount: number };
};

/**
 * Link a vehicle to the supplier, or change the amount of a linked one: the
 * same PUT does both. The amount PER vehicle is what the projection counts.
 */
export function SupplierVehicleDialog({
  supplierId,
  trigger,
  defaultAmount,
  currency,
  linkedVehicleIds,
  vehicle,
}: SupplierVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<RemoteOption | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [errors, setErrors] = useState<{
    vehicleId?: string;
    monthlyAmount?: string;
    form?: string;
  }>({});
  const { link } = useSupplierVehicles(supplierId);
  const picker = useVehicleOptions();
  const options = picker.options.filter(
    (option) => !linkedVehicleIds.includes(option.value),
  );

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setPicked(null);
    setAmount(vehicle ? vehicle.monthlyAmount : defaultAmount);
    setErrors({});
    picker.setSearch("");
  };

  const vehicleId = vehicle?.id ?? picked?.value ?? "";

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = {
      vehicleId: vehicleId ? undefined : "Escolha o veículo",
      monthlyAmount:
        amount === null || amount < 0 ? "Informe o valor" : undefined,
    };
    if (found.vehicleId || found.monthlyAmount) {
      setErrors(found);
      return;
    }
    setErrors({});
    link.mutate(
      { vehicleId, monthlyAmount: amount ?? 0 },
      {
        onSuccess: () => {
          toast.success(vehicle ? "Valor atualizado" : "Veículo vinculado");
          setOpen(false);
        },
        onError: (error) => {
          const apiError = toApiError(error);
          setErrors({
            monthlyAmount: apiError.fields?.monthlyAmount,
            form: apiError.fields?.monthlyAmount ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>
          {vehicle ? `Valor de ${vehicle.label}` : "Vincular veículo"}
        </DialogTitle>
        <DialogDescription>
          O valor por veículo é o que conta na projeção.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          {!vehicle && (
            <RemoteCombobox
              label="Veículo"
              value={vehicleId}
              selectedLabel={picked?.label}
              options={options}
              isLoading={picker.isLoading}
              search={picker.search}
              onSearchChange={picker.setSearch}
              onChange={(option) => {
                setPicked(option);
                setErrors((current) => ({ ...current, vehicleId: undefined }));
              }}
              placeholder="Escolha o veículo"
              searchPlaceholder="Placa, marca ou modelo…"
              error={errors.vehicleId}
            />
          )}
          <MoneyField
            label="Valor / mês"
            value={amount}
            onChange={setAmount}
            error={errors.monthlyAmount}
            currency={currency}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
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
              {vehicle ? "Salvar valor" : "Vincular"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
