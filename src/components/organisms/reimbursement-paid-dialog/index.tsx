import { Check } from "lucide-react";
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
import { DateField } from "@/components/molecules/date-field";
import { FilePicker } from "@/components/molecules/file-picker";
import { MoneyField } from "@/components/molecules/money-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { useMarkReimbursementPaid } from "@/hooks/api/gestao/reimbursements/useMarkReimbursementPaid";
import { todayInBrasilia } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

type ReimbursementPaidDialogProps = {
  reimbursementId: string;
  customerName: string;
  amount: number;
  pixKey: string;
};

type Errors = {
  paidAt?: string;
  paidAmount?: string;
  note?: string;
  form?: string;
};

/**
 * Records a refund the staff already paid OUTSIDE the system (pix sent by
 * hand in Asaas or the bank). Nothing is sent from here: it is a record,
 * with the receipt attached.
 */
export function ReimbursementPaidDialog({
  reimbursementId,
  customerName,
  amount,
  pixKey,
}: ReimbursementPaidDialogProps) {
  const [open, setOpen] = useState(false);
  const [paidAt, setPaidAt] = useState("");
  const [paidAmount, setPaidAmount] = useState<number | null>(amount);
  const [note, setNote] = useState("");
  const [receipts, setReceipts] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const markPaid = useMarkReimbursementPaid(reimbursementId);

  const onOpenChange = (next: boolean) => {
    if (markPaid.isPending) return;
    setOpen(next);
    if (!next) return;
    setPaidAt(todayInBrasilia());
    setPaidAmount(amount);
    setNote("");
    setReceipts([]);
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!paidAt) next.paidAt = "Informe a data do pagamento";
    else if (paidAt > todayInBrasilia()) {
      next.paidAt = "A data não pode ser no futuro";
    }
    if (!paidAmount || paidAmount <= 0)
      next.paidAmount = "Informe o valor pago";
    setErrors(next);
    if (Object.keys(next).length > 0 || !paidAmount) return;

    markPaid.mutate(
      { paidAt, paidAmount, note: note.trim() || null, receipts },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          setErrors({
            paidAt: fields.paidAt,
            paidAmount: fields.paidAmount,
            note: fields.note,
            form:
              fields.paidAt || fields.paidAmount || fields.note
                ? undefined
                : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Check />
          Marcar como pago
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Marcar como pago</DialogTitle>
        <DialogDescription>
          Registre o pix que você já fez por fora para {customerName} ({pixKey}
          ). O sistema não envia dinheiro: {formatCurrency(amount)} foi o valor
          pedido.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <DateField
            label="Data do pagamento"
            value={paidAt}
            onChange={(value) => {
              setPaidAt(value);
              setErrors({});
            }}
            error={errors.paidAt}
          />
          <MoneyField
            label="Valor pago"
            value={paidAmount}
            onChange={(value) => {
              setPaidAmount(value);
              setErrors({});
            }}
            error={errors.paidAmount}
          />
          <TextareaField
            label="Observação (opcional)"
            placeholder="Ex.: pago pelo Inter, pix id E123…"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            error={errors.note}
            disabled={markPaid.isPending}
          />
          <FilePicker
            label="Anexar comprovante"
            files={receipts}
            onChange={setReceipts}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={markPaid.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={markPaid.isPending}>
              {markPaid.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Marcar como pago
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
