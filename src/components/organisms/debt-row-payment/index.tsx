import { Plus } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { DebtListPaymentDialog } from "@/components/organisms/debt-payment-dialog";
import type { DebtListItem } from "@/types/debt";

/**
 * "Registrar pagamento" right from a row of the debt list (settled debts
 * have nothing to pay). Clicks stop here: the row around it opens the debt.
 * `compact` = icon only (table rows).
 */
export function DebtRowPayment({
  debt,
  compact = false,
}: {
  debt: DebtListItem;
  compact?: boolean;
}) {
  if (debt.balance.settled) return null;
  return (
    <Box onClick={(event) => event.stopPropagation()}>
      <DebtListPaymentDialog
        debtId={debt.id}
        trigger={
          <Button
            variant="outline"
            size={compact ? "icon" : "sm"}
            aria-label={`Registrar pagamento para ${debt.lendersLabel}`}
          >
            <Plus />
            {!compact && "Pagamento"}
          </Button>
        }
      />
    </Box>
  );
}
