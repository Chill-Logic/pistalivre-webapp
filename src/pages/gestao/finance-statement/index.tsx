import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { Pagination } from "@/components/molecules/pagination";
import { SectionTabs } from "@/components/molecules/section-tabs";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { StatementFilters } from "@/components/organisms/statement-filters";
import {
  StatementList,
  StatementListSkeleton,
} from "@/components/organisms/statement-list";
import {
  StatementTotals,
  StatementTotalsSkeleton,
} from "@/components/organisms/statement-totals";
import { FINANCE_TABS } from "@/constants/finance";
import { showsSourcePerLine } from "@/helpers/statement";
import { useStatement } from "@/hooks/api/gestao/finance/useStatement";
import { useStatementFilters } from "@/hooks/ui/useStatementFilters";

/** Consolidated statement, read-only (notes/internal flags are writes). */
export function FinanceStatementPage() {
  const { filters, period, setPeriod, setSource, setPage } =
    useStatementFilters();
  const statement = useStatement(filters);
  const data = statement.data;

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Financeiro" />
      <SectionTabs tabs={FINANCE_TABS} label="Seções do financeiro" />
      <StatementFilters
        period={period}
        source={filters.source}
        onPeriodChange={setPeriod}
        onSourceChange={setSource}
      />
      {statement.isPending && (
        <SkeletonRegion label="Carregando extrato…" className="space-y-4">
          <StatementTotalsSkeleton />
          <StatementListSkeleton />
        </SkeletonRegion>
      )}
      {statement.isError && (
        <QueryError
          error={statement.error}
          onRetry={() => statement.refetch()}
        />
      )}
      {data && (
        <>
          <StatementTotals sources={data.sources} />
          <StatementList
            lines={data.items}
            showSource={showsSourcePerLine(filters.source, data.sources)}
            isRefreshing={statement.isPlaceholderData}
          />
          {data.total > 0 && (
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </Box>
  );
}
