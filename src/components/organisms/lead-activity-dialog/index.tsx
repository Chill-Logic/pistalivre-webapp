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
import { FilePicker } from "@/components/molecules/file-picker";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { useAddLeadActivity } from "@/hooks/api/gestao/crm/useAddLeadActivity";
import { useLabels } from "@/hooks/ui/useLabels";

type LeadActivityDialogProps = {
  leadId: string;
  /** SDR types from GET /crm/options (no STATUS_CHANGE: that one is automatic). */
  types: string[];
  trigger: ReactNode;
};

/** Logs a call/attempt/WhatsApp/meeting/note, with optional attachments. */
export function LeadActivityDialog({
  leadId,
  types,
  trigger,
}: LeadActivityDialogProps) {
  const { label } = useLabels();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ type?: string; form?: string }>({});
  const add = useAddLeadActivity(leadId);

  const onOpenChange = (next: boolean) => {
    // Closing mid-upload would hide the result of what is still being sent.
    if (!next && add.isPending) return;
    setOpen(next);
    if (!next) return;
    setType("");
    setNote("");
    setFiles([]);
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!type) {
      setErrors({ type: "Escolha o tipo da atividade" });
      return;
    }
    setErrors({});
    add.mutate(
      { type, note: note.trim() || null, files },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          setErrors({
            type: apiError.fields?.type,
            form: apiError.fields?.type ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Registrar atividade</DialogTitle>
        <DialogDescription>
          Fica na trilha do lead, com o seu nome.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <SelectField
            label="Tipo"
            value={type}
            options={types.map((value) => ({
              value,
              label: label(LABEL_MAPS.leadActivity, value),
            }))}
            onChange={(value) => {
              setType(value);
              setErrors({});
            }}
            error={errors.type}
            disabled={add.isPending}
          />
          <TextareaField
            label="Anotação (opcional)"
            placeholder="O que foi conversado"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={add.isPending}
          />
          <FilePicker files={files} onChange={setFiles} disabled={add.isPending} />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={add.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={add.isPending}>
              {add.isPending && <Spinner className="text-primary-foreground" />}
              {files.length > 0 && add.isPending ? "Enviando anexos…" : "Registrar"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
