import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useDeleteDebt } from "@/hooks/api/gestao/debts/useDebtMutations";
import type { DebtDetail } from "@/types/debt";

/** Deletes the debt with its payments and receipts, then back to the list. */
export function DebtDeleteButton({ debt }: { debt: DebtDetail }) {
  const remove = useDeleteDebt(debt.id);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const payments = debt.payments.length;

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
          aria-label="Excluir dívida"
        >
          <Trash2 />
          Excluir
        </Button>
      }
      title="Excluir dívida?"
      description={`A dívida com ${debt.lendersLabel} é apagada${payments > 0 ? `, com ${payments === 1 ? "o pagamento lançado" : `os ${payments} pagamentos lançados`}` : ""} e os comprovantes. Não dá para desfazer.`}
      confirmLabel="Excluir dívida"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () => navigate(ROUTES.financeDebts, { replace: true }),
          onError: (error) => toast.error(moneyErrorMessage(error)),
        })
      }
    />
  );
}
