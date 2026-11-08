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
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { useLeadActions } from "@/hooks/api/gestao/crm/useLeadActions";
import type { LostReason } from "@/types/crm";

type LeadLostDialogProps = {
  leadId: string;
  reasons: LostReason[];
  /** Opens it from a button; without it, open it with `defaultOpen`. */
  trigger?: ReactNode;
  /**
   * Mounted already open (e.g. "Perdido" picked in a list row's stage
   * select); `onClose` tells the parent it closed (sent or given up).
   */
  defaultOpen?: boolean;
  onClose?: () => void;
};

/**
 * Loss needs at least one mapped reason (they feed the report) plus an
 * optional note. It is never undone: reopening creates a new attempt.
 */
export function LeadLostDialog({
  leadId,
  reasons,
  trigger,
  defaultOpen = false,
  onClose,
}: LeadLostDialogProps) {
  const [open, setOpenState] = useState(defaultOpen);
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ reasons?: string; form?: string }>({});
  const { lost } = useLeadActions(leadId);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (!next) onClose?.();
  };

  const onOpenChange = (next: boolean) => {
    if (lost.isPending) return;
    setOpen(next);
    if (!next) return;
    setPicked([]);
    setNote("");
    setErrors({});
  };

  const toggle = (code: string, checked: boolean) => {
    setPicked((current) =>
      checked ? [...current, code] : current.filter((c) => c !== code),
    );
    setErrors((current) => ({ ...current, reasons: undefined }));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (picked.length === 0) {
      setErrors({ reasons: "Selecione ao menos um motivo da perda" });
      return;
    }
    setErrors({});
    lost.mutate(
      { reasons: picked, note: note.trim() || null },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          setErrors({
            reasons: apiError.fields?.reasons,
            form: apiError.fields?.reasons ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogTitle>Marcar como perdido</DialogTitle>
        <DialogDescription>
          A perda não é desfeita. Se o lead voltar, retome-o: isso abre uma nova
          tentativa e mantém esta no histórico.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Box role="group" aria-label="Motivos da perda" className="space-y-3">
            {reasons.map((reason) => (
              <CheckboxField
                key={reason.code}
                label={reason.label}
                checked={picked.includes(reason.code)}
                onChange={(checked) => toggle(reason.code, checked)}
                disabled={lost.isPending}
              />
            ))}
            {errors.reasons && <Text tone="destructive">{errors.reasons}</Text>}
          </Box>
          <TextareaField
            label="Observação (opcional)"
            placeholder="Detalhe o que aconteceu"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={lost.isPending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={lost.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={lost.isPending}
            >
              {lost.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Marcar como perdido
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
