import { X } from "lucide-react";
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
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { useRejectReimbursement } from "@/hooks/api/gestao/reimbursements/useRejectReimbursement";
import type { ReimbursementMissingItem } from "@/types/staff-reimbursement";
import { formatCurrency } from "@/utils/format";

type ReimbursementRejectDialogProps = {
  reimbursementId: string;
  customerName: string;
  amount: number;
  missingItems: ReimbursementMissingItem[];
};

type Errors = { missing?: string; note?: string; form?: string };

/**
 * Rejection = what was missing (checklist) and/or a note. Both go to the
 * customer, who can fix it and ask again. Nothing is paid or reversed.
 */
export function ReimbursementRejectDialog({
  reimbursementId,
  customerName,
  amount,
  missingItems,
}: ReimbursementRejectDialogProps) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const reject = useRejectReimbursement(reimbursementId);

  const onOpenChange = (next: boolean) => {
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
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = note.trim();
    if (picked.length === 0 && !trimmed) {
      setErrors({
        note: "Marque o que faltou ou escreva o motivo da recusa",
      });
      return;
    }
    setErrors({});
    reject.mutate(
      { missing: picked, note: trimmed || null },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          setErrors({
            missing: fields.missing,
            note: fields.note,
            form: fields.missing || fields.note ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <X />
          Recusar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Recusar reembolso</DialogTitle>
        <DialogDescription>
          {customerName} pediu {formatCurrency(amount)}. Ele verá o que faltou e
          poderá ajustar e pedir de novo.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Box role="group" aria-label="O que faltou" className="space-y-3">
            <Text weight="medium">O que faltou</Text>
            {missingItems.map((item) => (
              <CheckboxField
                key={item.code}
                label={item.label}
                checked={picked.includes(item.code)}
                onChange={(checked) => toggle(item.code, checked)}
                disabled={reject.isPending}
              />
            ))}
            {errors.missing && <Text tone="destructive">{errors.missing}</Text>}
          </Box>
          <TextareaField
            label="Observação para o cliente"
            placeholder="Ex.: o recibo está ilegível, envie outra foto"
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              setErrors({});
            }}
            error={errors.note}
            disabled={reject.isPending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={reject.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={reject.isPending}
            >
              {reject.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Recusar reembolso
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
