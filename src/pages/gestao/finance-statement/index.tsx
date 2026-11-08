import { Box } from "@/components/atoms/box";
import { Pagination } from "@/components/molecules/pagination";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { BankStatementPdfButton } from "@/components/organisms/bank-statement-pdf-button";
import { QueryError } from "@/components/organisms/query-error";
import { StatementExportDialog } from "@/components/organisms/statement-export-dialog";
import { StatementExportsCard } from "@/components/organisms/statement-exports-card";
import { StatementFilters } from "@/components/organisms/statement-filters";
import {
  StatementList,
  StatementListSkeleton,
} from "@/components/organisms/statement-list";
import {
  StatementTotals,
  StatementTotalsSkeleton,
} from "@/components/organisms/statement-totals";
import { showsSourcePerLine } from "@/helpers/statement";
import { useStatement } from "@/hooks/api/gestao/finance/useStatement";
import { useStatementFilters } from "@/hooks/ui/useStatementFilters";

/**
 * Consolidated statement (notes/internal flags are the writes), the
 * accountant's spreadsheets with their history and the bank's official PDF.
 */
export function FinanceStatementPage() {
  const { filters, period, setPeriod, setRange, setSource, setPage } =
    useStatementFilters();
  const statement = useStatement(filters);
  const data = statement.data;

  return (
    <Box className="space-y-4 md:space-y-6">
      <Box className="flex flex-wrap justify-end gap-2">
        {filters.source !== "ASAAS" && (
          <BankStatementPdfButton start={filters.start} end={filters.end} />
        )}
        <StatementExportDialog
          start={filters.start}
          end={filters.end}
          source={filters.source}
        />
      </Box>
      <StatementFilters
        period={period}
        source={filters.source}
        start={filters.start}
        end={filters.end}
        onPeriodChange={setPeriod}
        onRangeChange={setRange}
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
      <StatementExportsCard />
    </Box>
  );
}
