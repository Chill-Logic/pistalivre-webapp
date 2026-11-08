import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
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
import {
  RemoteCombobox,
  type RemoteOption,
} from "@/components/molecules/remote-combobox";
import { toApiError } from "@/helpers/api-error";
import { useVehicleSupplierLinks } from "@/hooks/api/gestao/vehicles/useVehicleSupplierLinks";
import { useSupplierOptions } from "@/hooks/ui/useRemoteOptions";
import { formatCurrency } from "@/utils/format";

type Errors = { supplierId?: string; monthlyAmount?: string; form?: string };

type VehicleSupplierDialogProps = {
  vehicleId: string;
  /** Already linked: hidden from the picker. */
  linkedSupplierIds: string[];
};

/**
 * "Vincular custo fixo": a VEHICLE-scope fixed cost not linked yet + the
 * amount per month for this vehicle (suggested: the fixed cost's base).
 * The vehicle-side twin of the fixed cost's "Vincular veículo".
 */
export function VehicleSupplierDialog({
  vehicleId,
  linkedSupplierIds,
}: VehicleSupplierDialogProps) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<RemoteOption | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const { save } = useVehicleSupplierLinks(vehicleId);
  const picker = useSupplierOptions({ scope: "VEHICLE" });
  const options = picker.items
    .filter((supplier) => !linkedSupplierIds.includes(supplier.id))
    .map((supplier) => ({
      value: supplier.id,
      label: supplier.name,
      detail: `${formatCurrency(supplier.monthlyAmount)}/mês (base)${
        supplier.active ? "" : " · inativo"
      }`,
    }));

  const onOpenChange = (next: boolean) => {
    if (save.isPending) return;
    setOpen(next);
    if (!next) return;
    setPicked(null);
    setAmount(null);
    setErrors({});
    picker.setSearch("");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found: Errors = {
      supplierId: picked ? undefined : "Escolha o custo fixo",
      monthlyAmount:
        amount === null || amount < 0 ? "Informe o valor" : undefined,
    };
    if (found.supplierId || found.monthlyAmount || !picked) {
      setErrors(found);
      return;
    }
    setErrors({});
    save.mutate(
      { supplierId: picked.value, monthlyAmount: amount ?? 0 },
      {
        onSuccess: () => {
          toast.success("Custo fixo vinculado");
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
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus />
          Vincular custo fixo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Vincular custo fixo</DialogTitle>
        <DialogDescription>
          Só os custos fixos por veículo. O valor por veículo é o que conta na
          projeção.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <RemoteCombobox
            label="Custo fixo"
            value={picked?.value ?? ""}
            selectedLabel={picked?.label}
            options={options}
            isLoading={picker.isLoading}
            search={picker.search}
            onSearchChange={picker.setSearch}
            onChange={(option) => {
              setPicked(option);
              const base = picker.items.find(
                (supplier) => supplier.id === option.value,
              )?.monthlyAmount;
              if (amount === null && base !== undefined) setAmount(base);
              setErrors((current) => ({ ...current, supplierId: undefined }));
            }}
            placeholder="Escolha o custo fixo"
            searchPlaceholder="Nome do custo fixo…"
            error={errors.supplierId}
          />
          <MoneyField
            label="Valor / mês"
            value={amount}
            onChange={setAmount}
            error={errors.monthlyAmount}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
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
              Vincular
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
