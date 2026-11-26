import { Check, HandCoins, Pencil } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { DebtListPaymentDialog } from "@/components/organisms/debt-payment-dialog";
import { ExpenseDialog } from "@/components/organisms/expense-dialog";
import { PassOnCostDialog } from "@/components/organisms/pass-on-cost-dialog";
import { queryKeys } from "@/constants/query-keys";
import { calendarDay } from "@/utils/date";
import type { MonthItem } from "@/types/expense";

/**
 * The one action of a month's row: record it ("Registrar"), change what was
 * recorded (pencil), or pay a debt installment (the debt's own dialog, so the
 * debt's balance stays right). A paid installment has nothing left to do.
 */
export function MonthItemAction({ item }: { item: MonthItem }) {
  if (item.debt) {
    if (item.status === "PAID") return null;
    return (
      <Box onClick={(event) => event.stopPropagation()}>
        <DebtListPaymentDialog
          debtId={item.debt.id}
          installment={item.debt.installment}
          trigger={
            <Button variant="outline" size="sm">
              <Check />
              Pagar
            </Button>
          }
        />
      </Box>
    );
  }
  return (
    <Box className="flex gap-1" onClick={(event) => event.stopPropagation()}>
      {item.expense && (
        <PassOnCostDialog
          source={{ expenseId: item.expense.id }}
          defaults={{
            amount: item.amount,
            description: item.description,
            incurredAt: calendarDay(item.paidAt ?? `${item.month}-01`),
            origin: "OTHER",
          }}
          invalidate={queryKeys.expenses.all}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Cobrar ${item.description} de um cliente`}
            >
              <HandCoins />
            </Button>
          }
        />
      )}
      <ExpenseDialog
        target={{ kind: "item", item }}
        trigger={
          item.expense ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Editar lançamento de ${item.description}`}
            >
              <Pencil />
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              <Check />
              Registrar
            </Button>
          )
        }
      />
    </Box>
  );
}
