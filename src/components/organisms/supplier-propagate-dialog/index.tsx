import { useState, type FormEvent, type ReactNode } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
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
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { MoneyField } from "@/components/molecules/money-field";
import { toApiError } from "@/helpers/api-error";
import { useSupplierVehicles } from "@/hooks/api/gestao/suppliers/useSupplierVehicles";
import type { SupplierVehicleLink } from "@/types/supplier";
import { formatCurrency } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

type SupplierPropagateDialogProps = {
  supplierId: string;
  trigger: ReactNode;
  defaultAmount: number;
  links: SupplierVehicleLink[];
};

/** Same monthly amount on all linked vehicles, or on the checked ones. */
export function SupplierPropagateDialog({
  supplierId,
  trigger,
  defaultAmount,
  links,
}: SupplierPropagateDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(defaultAmount);
  const [selected, setSelected] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    monthlyAmount?: string;
    vehicleIds?: string;
    form?: string;
  }>({});
  const { propagate } = useSupplierVehicles(supplierId);
  const allIds = links.map((link) => link.vehicle.id);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setAmount(defaultAmount);
    setSelected(allIds);
    setErrors({});
  };

  const toggle = (vehicleId: string, checked: boolean) =>
    setSelected((current) =>
      checked
        ? [...current, vehicleId]
        : current.filter((id) => id !== vehicleId),
    );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = {
      monthlyAmount:
        amount === null || amount < 0 ? "Informe o valor" : undefined,
      vehicleIds: selected.length ? undefined : "Marque ao menos um veículo",
    };
    if (found.monthlyAmount || found.vehicleIds) {
      setErrors(found);
      return;
    }
    setErrors({});
    const everyone = selected.length === allIds.length;
    propagate.mutate(
      {
        monthlyAmount: amount ?? 0,
        // No ids = all linked vehicles (also the ones linked meanwhile).
        vehicleIds: everyone ? undefined : selected,
      },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          setErrors({
            monthlyAmount: apiError.fields?.monthlyAmount,
            vehicleIds: apiError.fields?.vehicleIds,
            form:
              apiError.fields?.monthlyAmount || apiError.fields?.vehicleIds
                ? undefined
                : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>Propagar valor</DialogTitle>
        <DialogDescription>
          Aplica o mesmo valor por mês aos veículos marcados.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <MoneyField
            label="Valor / mês"
            value={amount}
            onChange={setAmount}
            error={errors.monthlyAmount}
          />
          <Box className="space-y-2">
            <Box className="flex items-center justify-between gap-2">
              <Text weight="medium">
                Veículos ({selected.length} de {allIds.length})
              </Text>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSelected(
                    selected.length === allIds.length ? [] : allIds,
                  )
                }
              >
                {selected.length === allIds.length
                  ? "Desmarcar todos"
                  : "Marcar todos"}
              </Button>
            </Box>
            <Box className="max-h-64 space-y-3 overflow-y-auto rounded-md border p-3">
              {links.map((link) => (
                <CheckboxField
                  key={link.linkId}
                  label={formatPlate(link.vehicle.plate)}
                  hint={`${link.vehicle.label} · hoje ${formatCurrency(link.monthlyAmount)} / mês`}
                  checked={selected.includes(link.vehicle.id)}
                  onChange={(checked) => toggle(link.vehicle.id, checked)}
                />
              ))}
            </Box>
            {errors.vehicleIds && (
              <Text tone="destructive">{errors.vehicleIds}</Text>
            )}
          </Box>
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={propagate.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={propagate.isPending}>
              {propagate.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Aplicar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
