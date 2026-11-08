import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useDeleteCharge } from "@/hooks/api/gestao/charges/useChargeMutations";
import { moneyErrorMessage } from "@/helpers/money-errors";
import type { Charge } from "@/types/rental";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { toast } from "sonner";

/**
 * Deletes on both sides (Asaas and here) with its receipts. A PAID charge
 * only goes when it is a manual entry of ours, and the warning says that the
 * received money leaves the reports.
 */
export function ChargeDeleteButton({ charge }: { charge: Charge }) {
  const remove = useDeleteCharge(charge.id, charge.rentalId);
  const [open, setOpen] = useState(false);
  const paid = charge.amounts.isPaid;

  return (
    <ConfirmDialog
      destructive
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          aria-label={`Excluir cobrança de ${formatCalendarDate(charge.dueDate)}`}
        >
          <Trash2 />
          Excluir
        </Button>
      }
      title={paid ? "Excluir um recebimento?" : "Excluir cobrança?"}
      description={
        paid
          ? `Este lançamento manual já foi pago (${formatCurrency(charge.paidValue ?? charge.amounts.amount)}). Excluir apaga o recebimento: ele sai do extrato da locação, da inadimplência e dos relatórios. Não dá para desfazer.`
          : charge.channel === "asaas"
            ? "A cobrança é cancelada no Asaas (a fatura e o pix param de valer) e apagada aqui, com os comprovantes."
            : "O lançamento é apagado, com os comprovantes."
      }
      confirmLabel={paid ? "Excluir recebimento" : "Excluir cobrança"}
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () => setOpen(false),
          onError: (error) => toast.error(moneyErrorMessage(error)),
        })
      }
    />
  );
}
