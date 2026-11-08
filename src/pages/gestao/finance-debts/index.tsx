import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { Box } from "@/components/atoms/box";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { DebtList } from "@/components/organisms/debt-list";
import { DebtTable } from "@/components/organisms/debt-table";
import {
  DebtsSummary,
  DebtsSummarySkeleton,
} from "@/components/organisms/debts-summary";
import { ListFooter } from "@/components/organisms/list-footer";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES } from "@/constants/routes";
import { useDebtList } from "@/hooks/api/gestao/debts/useDebts";
import { useDebtFilters } from "@/hooks/ui/useDebtFilters";
import { useListView } from "@/hooks/ui/useListView";

/** Company debts, read-only: payments are registered in the old app for now. */
export function FinanceDebtsPage() {
  const { filters, setPage, setPageSize } = useDebtFilters();
  const { view, setView, isDesktop } = useListView();
  const debts = useDebtList(filters, isDesktop);
  const summary = debts.firstPage?.summary;

  if (debts.isError) {
    return <QueryError error={debts.error} onRetry={() => debts.refetch()} />;
  }

  return (
    <Box className="space-y-4 md:space-y-6">
      {debts.isPending ? (
        <SkeletonRegion label="Carregando resumo…">
          <DebtsSummarySkeleton />
        </SkeletonRegion>
      ) : (
        summary && debts.total > 0 && <DebtsSummary summary={summary} />
      )}
      <Box className="flex items-center justify-end gap-2">
        {debts.total > 0 && <ViewToggle view={view} onChange={setView} />}
        <Button asChild size="sm">
          <Link to={ROUTES.debtNew}>
            <Plus />
            Nova dívida
          </Link>
        </Button>
      </Box>
      {view === "tabela" ? (
        <DebtTable
          debts={debts.items}
          isLoading={debts.isPending}
          isRefreshing={debts.isRefreshing}
        />
      ) : (
        <DebtList
          debts={debts.items}
          isLoading={debts.isPending}
          isRefreshing={debts.isRefreshing}
        />
      )}
      <ListFooter
        result={debts}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Box>
  );
}
