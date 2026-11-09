import { Plus, ReceiptText } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { MonthSwitcher } from "@/components/molecules/month-switcher";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { ExpenseDialog } from "@/components/organisms/expense-dialog";
import {
  ExpenseMonthGroups,
  ExpenseMonthGroupsSkeleton,
} from "@/components/organisms/expense-month-groups";
import {
  ExpenseMonthSummary,
  ExpenseMonthSummarySkeleton,
} from "@/components/organisms/expense-month-summary";
import { ExpensePendingMonths } from "@/components/organisms/expense-pending-months";
import { QueryError } from "@/components/organisms/query-error";
import { useExpenseMonth } from "@/hooks/api/gestao/expenses/useExpenseMonth";
import { useExpenseMonthFilter } from "@/hooks/ui/useExpenseMonthFilter";

/**
 * Contas do mês: every bill of the operation in a month — fixed costs, debt
 * installments and one-offs — and what happened to each (paid when, still
 * open, no bill). Bookkeeping for whoever doesn't see the bank accounts; the
 * money always leaves outside the system.
 */
export function FinanceBillsPage() {
  const { month, setMonth } = useExpenseMonthFilter();
  const bills = useExpenseMonth(month);

  return (
    <Box className="space-y-4 md:space-y-6">
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <MonthSwitcher month={month} onChange={setMonth} />
        <ExpenseDialog
          target={{ kind: "oneOff", month }}
          trigger={
            <Button size="sm">
              <Plus />
              Despesa avulsa
            </Button>
          }
        />
      </Box>
      {bills.isError ? (
        <QueryError error={bills.error} onRetry={() => bills.refetch()} />
      ) : bills.isPending ? (
        <FinanceBillsSkeleton />
      ) : (
        <>
          <ExpenseMonthSummary totals={bills.data.totals} />
          <ExpensePendingMonths months={bills.data.pendingBefore} onOpen={setMonth} />
          {bills.data.items.length === 0 ? (
            <EmptyState
              icon={ReceiptText}
              title="Nenhuma conta neste mês"
              description="Os custos fixos aparecem aqui a partir do mês em que começam. Gastos pontuais entram em “Despesa avulsa”."
            />
          ) : (
            <ExpenseMonthGroups items={bills.data.items} isRefreshing={bills.isRefreshing} />
          )}
        </>
      )}
    </Box>
  );
}

function FinanceBillsSkeleton() {
  return (
    <SkeletonRegion label="Carregando contas do mês…">
      <Box className="space-y-4 md:space-y-6">
        <ExpenseMonthSummarySkeleton />
        <ExpenseMonthGroupsSkeleton />
      </Box>
    </SkeletonRegion>
  );
}
