import { Box } from "@/components/atoms/box";
import {
  DelinquencySummary,
  DelinquencySummarySkeleton,
} from "@/components/organisms/delinquency-summary";
import {
  FinanceBalances,
  FinanceBalancesSkeleton,
} from "@/components/organisms/finance-balances";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import {
  ToCollectTimeline,
  ToCollectTimelineSkeleton,
} from "@/components/organisms/to-collect-timeline";
import { FinanceLayout } from "@/components/templates/finance-layout";
import { useFinanceBalances } from "@/hooks/api/gestao/finance/useFinanceBalances";
import { useFinanceDelinquency } from "@/hooks/api/gestao/finance/useFinanceDelinquency";
import { useFinanceToCollect } from "@/hooks/api/gestao/finance/useFinanceToCollect";

/**
 * Finance overview, read-only. Each block loads and fails on its own: a bank
 * that is down must not hide what is overdue.
 */
export function FinancePage() {
  const balances = useFinanceBalances();
  const toCollect = useFinanceToCollect();
  const delinquency = useFinanceDelinquency();

  return (
    <Box className="space-y-4 md:space-y-6">
      <FinanceLayout
        balances={
          <QueryBoundary
            query={balances}
            label="Carregando saldos…"
            skeleton={<FinanceBalancesSkeleton />}
          >
            {(data) => <FinanceBalances balances={data} />}
          </QueryBoundary>
        }
        toCollect={
          <QueryBoundary
            query={toCollect}
            label="Carregando o que há a receber…"
            skeleton={<ToCollectTimelineSkeleton />}
          >
            {(data) => <ToCollectTimeline toCollect={data} />}
          </QueryBoundary>
        }
        delinquency={
          <QueryBoundary
            query={delinquency}
            label="Carregando inadimplência…"
            skeleton={<DelinquencySummarySkeleton />}
          >
            {(data) => <DelinquencySummary delinquency={data} />}
          </QueryBoundary>
        }
      />
    </Box>
  );
}
