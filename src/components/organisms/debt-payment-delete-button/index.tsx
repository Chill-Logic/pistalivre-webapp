import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useDeleteDebtPayment } from "@/hooks/api/gestao/debts/useDebtMutations";
import type { DebtPayment } from "@/types/debt";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/**
 * There is no "edit payment" (same as the management app): a wrong entry is
 * deleted, with its receipts, and logged again.
 */
export function DebtPaymentDeleteButton({ payment }: { payment: DebtPayment }) {
  const remove = useDeleteDebtPayment();
  const [open, setOpen] = useState(false);
  const day = formatCalendarDate(payment.paidAt);

  return (
    <ConfirmDialog
      destructive
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          aria-label={`Excluir pagamento de ${day}`}
        >
          <Trash2 />
        </Button>
      }
      title="Excluir pagamento?"
      description={`O pagamento de ${formatCurrency(payment.amount)} em ${day} sai da dívida, com os comprovantes, e o saldo volta a subir. Para corrigir, exclua e registre de novo.`}
      confirmLabel="Excluir pagamento"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(payment.id, {
          onSuccess: () => setOpen(false),
          onError: (error) => toast.error(moneyErrorMessage(error)),
        })
      }
    />
  );
}
