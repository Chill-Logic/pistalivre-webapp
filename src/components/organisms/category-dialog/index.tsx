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
import { FormField } from "@/components/molecules/form-field";
import { SelectField } from "@/components/molecules/select-field";
import { toApiError } from "@/helpers/api-error";
import { useCategoryWrites } from "@/hooks/api/gestao/categories/useCategoryWrites";
import type { VehicleCategory } from "@/types/category";
import type { VehicleType } from "@/types/vehicle";

type CategoryDialogProps = {
  trigger: ReactNode;
  types: VehicleType[];
  /** Present = rename; absent = new (type chosen here, or preset). */
  category?: VehicleCategory;
  /** New category: the type already chosen (the type's own card). */
  typeId?: string;
};

type Errors = { name?: string; vehicleTypeId?: string; form?: string };

/**
 * New category (type + name) or renaming one: its vehicles stay in it. The
 * type of a category doesn't change (its vehicles are of that type).
 */
export function CategoryDialog({
  trigger,
  types,
  category,
  typeId,
}: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [vehicleTypeId, setVehicleTypeId] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const { create, rename } = useCategoryWrites();
  const save = category ? rename : create;

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setName(category?.name ?? "");
    setVehicleTypeId(category?.type.id ?? typeId ?? "");
    setErrors({});
  };

  const onError = (error: unknown) => {
    const apiError = toApiError(error);
    const fields = {
      name: apiError.fields?.name,
      vehicleTypeId: apiError.fields?.vehicleTypeId,
    };
    setErrors({
      ...fields,
      form: fields.name || fields.vehicleTypeId ? undefined : apiError.message,
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Informe o nome";
    if (!vehicleTypeId) next.vehicleTypeId = "Escolha o tipo";
    setErrors(next);
    if (next.name || next.vehicleTypeId) return;
    const done = { onSuccess: () => setOpen(false), onError };
    if (category) rename.mutate({ id: category.id, name: name.trim() }, done);
    else create.mutate({ vehicleTypeId, name: name.trim() }, done);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>
          {category ? `Renomear ${category.name}` : "Nova categoria"}
        </DialogTitle>
        <DialogDescription>
          {category
            ? "Os veículos dessa categoria continuam nela, com o nome novo."
            : "Use o nome da espécie do documento (CRLV), como Passageiro ou Carga: a leitura do documento escolhe a categoria por ele."}
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          {!category && (
            <SelectField
              label="Tipo"
              value={vehicleTypeId}
              options={types.map((type) => ({
                value: type.id,
                label: type.name,
              }))}
              onChange={(value) => {
                setVehicleTypeId(value);
                setErrors({});
              }}
              placeholder="Selecione"
              error={errors.vehicleTypeId}
              disabled={save.isPending}
            />
          )}
          <FormField
            label="Nome"
            placeholder="Ex.: Passageiro"
            maxLength={40}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setErrors({});
            }}
            error={errors.name}
            disabled={save.isPending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={save.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Spinner className="text-primary-foreground" />}
              {category ? "Salvar" : "Criar categoria"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
