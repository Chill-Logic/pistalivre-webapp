import { AiAnchor } from "@/components/atoms/ai-anchor";
import { Box } from "@/components/atoms/box";
import {
  DelinquencySummary,
  DelinquencySummarySkeleton,
} from "@/components/organisms/delinquency-summary";
import {
  FinanceBalances,
  FinanceBalancesSkeleton,
} from "@/components/organisms/finance-balances";
import { FinanceSyncButton } from "@/components/organisms/finance-sync-button";
import { ManualPaymentDialog } from "@/components/organisms/manual-payment-dialog";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { StandaloneChargeDialog } from "@/components/organisms/standalone-charge-dialog";
import { StandaloneInvoiceDialog } from "@/components/organisms/standalone-invoice-dialog";
import {
  TransfersCard,
  TransfersCardSkeleton,
} from "@/components/organisms/transfers-card";
import {
  ToCollectTimeline,
  ToCollectTimelineSkeleton,
} from "@/components/organisms/to-collect-timeline";
import { FinanceLayout } from "@/components/templates/finance-layout";
import { useFinanceBalances } from "@/hooks/api/gestao/finance/useFinanceBalances";
import { useFinanceDelinquency } from "@/hooks/api/gestao/finance/useFinanceDelinquency";
import { useFinanceToCollect } from "@/hooks/api/gestao/finance/useFinanceToCollect";
import { useTransfers } from "@/hooks/api/gestao/finance/useTransfers";

/**
 * Finance overview + issuing (charge, NF, payment received outside Asaas)
 * and "Sincronizar do Asaas". Each block loads and fails on its own: a bank
 * that is down must not hide what is overdue.
 */
export function FinancePage() {
  const balances = useFinanceBalances();
  const toCollect = useFinanceToCollect();
  const delinquency = useFinanceDelinquency();
  const transfers = useTransfers();

  return (
    <Box className="space-y-4 md:space-y-6">
      <Box className="flex flex-wrap justify-end gap-2">
        <FinanceSyncButton />
        <StandaloneInvoiceDialog />
        <ManualPaymentDialog />
        <StandaloneChargeDialog />
      </Box>
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
            {(data) => (
              <AiAnchor id="to-collect">
                <ToCollectTimeline toCollect={data} />
              </AiAnchor>
            )}
          </QueryBoundary>
        }
        delinquency={
          <QueryBoundary
            query={delinquency}
            label="Carregando inadimplência…"
            skeleton={<DelinquencySummarySkeleton />}
          >
            {(data) => (
              <AiAnchor id="delinquency">
                <DelinquencySummary delinquency={data} />
              </AiAnchor>
            )}
          </QueryBoundary>
        }
        transfers={
          <QueryBoundary
            query={transfers}
            label="Carregando transferências emitidas…"
            skeleton={<TransfersCardSkeleton />}
          >
            {(data) => <TransfersCard transfers={data} />}
          </QueryBoundary>
        }
      />
    </Box>
  );
}
