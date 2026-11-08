import { useState, type FormEvent, type ReactNode } from "react";
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
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { FormField } from "@/components/molecules/form-field";
import { SelectField } from "@/components/molecules/select-field";
import { INSPECTION_ITEM_KINDS } from "@/constants/models";
import { toApiError } from "@/helpers/api-error";
import { useCreateInspectionRequirement } from "@/hooks/api/gestao/templates/useInspectionTemplateMutations";
import type { InspectionItemKind } from "@/types/template";

type InspectionRequirementDialogProps = {
  vehicleType: { id: string; name: string };
  trigger: ReactNode;
};

/**
 * New item asked in every inspection of a vehicle type. It goes to the end
 * of the list; the key comes from the label (never typed).
 */
export function InspectionRequirementDialog({
  vehicleType,
  trigger,
}: InspectionRequirementDialogProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<InspectionItemKind>("PHOTO");
  const [required, setRequired] = useState(true);
  const [errors, setErrors] = useState<{ label?: string; form?: string }>({});
  const create = useCreateInspectionRequirement();

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setLabel("");
    setKind("PHOTO");
    setRequired(true);
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!label.trim()) {
      setErrors({ label: "Informe o nome do item" });
      return;
    }
    setErrors({});
    create.mutate(
      { vehicleTypeId: vehicleType.id, label: label.trim(), kind, required },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          setErrors({
            label: apiError.fields?.label,
            form: apiError.fields?.label ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Novo item · {vehicleType.name}</DialogTitle>
        <DialogDescription>
          Entra no fim da lista e passa a ser pedido nas próximas vistorias
          deste tipo de veículo.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            label="Nome do item"
            placeholder="Ex.: Painel / hodômetro"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
              setErrors({});
            }}
            error={errors.label}
            disabled={create.isPending}
          />
          <SelectField
            label="Tipo"
            value={kind}
            options={INSPECTION_ITEM_KINDS}
            onChange={(value) => setKind(value as InspectionItemKind)}
            disabled={create.isPending}
          />
          <CheckboxField
            label="Obrigatório"
            hint="Desmarcado, o item fica opcional na vistoria."
            checked={required}
            onChange={setRequired}
            disabled={create.isPending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={create.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Adicionar item
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
