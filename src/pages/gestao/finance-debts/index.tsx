import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { SectionTabs } from "@/components/molecules/section-tabs";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { DebtList, DebtListSkeleton } from "@/components/organisms/debt-list";
import {
  DebtsSummary,
  DebtsSummarySkeleton,
} from "@/components/organisms/debts-summary";
import { QueryError } from "@/components/organisms/query-error";
import { FINANCE_TABS } from "@/constants/finance";
import { useDebts } from "@/hooks/api/gestao/debts/useDebts";

/** Company debts, read-only: payments are registered in the old app for now. */
export function FinanceDebtsPage() {
  const debts = useDebts();

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Financeiro" />
      <SectionTabs tabs={FINANCE_TABS} label="Seções do financeiro" />
      {debts.isPending && (
        <SkeletonRegion label="Carregando débitos…" className="space-y-6">
          <DebtsSummarySkeleton />
          <DebtListSkeleton />
        </SkeletonRegion>
      )}
      {debts.isError && (
        <QueryError error={debts.error} onRetry={() => debts.refetch()} />
      )}
      {debts.data && (
        <Box className="space-y-6">
          {debts.data.items.length > 0 && (
            <DebtsSummary summary={debts.data.summary} />
          )}
          <DebtList debts={debts.data.items} />
        </Box>
      )}
    </Box>
  );
}
