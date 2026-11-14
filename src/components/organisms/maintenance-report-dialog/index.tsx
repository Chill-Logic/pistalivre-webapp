import { Wrench } from "lucide-react";
import { useState, type FormEvent } from "react";
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
import { DateField } from "@/components/molecules/date-field";
import { FilePicker } from "@/components/molecules/file-picker";
import { MoneyField } from "@/components/molecules/money-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { useReportMaintenance } from "@/hooks/api/cliente/rentals/useReportMaintenance";
import { todayInBrasilia } from "@/utils/date";

type Errors = {
  description?: string;
  cost?: string;
  performedAt?: string;
  files?: string;
  form?: string;
};

/**
 * A service the renter paid on the rented vehicle: what was done, how much,
 * when, and the receipt (required: a maintenance without proof cannot be
 * paid back). After saving, the row offers "Pedir reembolso".
 */
export function MaintenanceReportDialog({ rentalId }: { rentalId: string }) {
  const report = useReportMaintenance(rentalId);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState<number | null>(null);
  const [performedAt, setPerformedAt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  const onOpenChange = (next: boolean) => {
    if (report.isPending) return;
    setOpen(next);
    if (!next) return;
    setDescription("");
    setCost(null);
    setPerformedAt(todayInBrasilia());
    setFiles([]);
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!description.trim()) next.description = "Conte o que foi feito";
    if (!cost || cost <= 0) next.cost = "Informe o valor pago";
    if (performedAt && performedAt > todayInBrasilia()) {
      next.performedAt = "A data não pode ser no futuro";
    }
    if (files.length === 0) next.files = "Anexe o recibo ou comprovante";
    setErrors(next);
    if (Object.keys(next).length || !cost) return;

    report.mutate(
      {
        description: description.trim(),
        cost,
        performedAt: performedAt || undefined,
        files,
      },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          const placed =
            fields.description ||
            fields.cost ||
            fields.performedAt ||
            fields.files;
          setErrors({
            description: fields.description,
            cost: fields.cost,
            performedAt: fields.performedAt,
            files: fields.files,
            form: placed ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Wrench />
          Registrar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Registrar manutenção</DialogTitle>
        <DialogDescription>
          Pagou um serviço no veículo do seu bolso? Registre com o recibo e
          depois peça o reembolso.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <TextareaField
            label="O que foi feito"
            placeholder="Ex.: troca de óleo e filtro na oficina X"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setErrors((current) => ({ ...current, description: undefined }));
            }}
            error={errors.description}
            disabled={report.isPending}
          />
          <MoneyField
            label="Valor pago"
            value={cost}
            onChange={(value) => {
              setCost(value);
              setErrors((current) => ({ ...current, cost: undefined }));
            }}
            error={errors.cost}
          />
          <DateField
            label="Data"
            value={performedAt}
            onChange={setPerformedAt}
            error={errors.performedAt}
          />
          <Box className="space-y-1">
            <FilePicker
              label="Anexar recibo"
              files={files}
              onChange={(next) => {
                setFiles(next);
                setErrors((current) => ({ ...current, files: undefined }));
              }}
            />
            {errors.files ? (
              <Text tone="destructive">{errors.files}</Text>
            ) : (
              <Text size="xs" tone="muted">
                Tire uma foto na hora ou escolha da galeria.
              </Text>
            )}
          </Box>
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={report.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={report.isPending}>
              {report.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Registrar manutenção
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
