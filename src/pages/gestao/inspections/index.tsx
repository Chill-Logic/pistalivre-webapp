import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { Pagination } from "@/components/molecules/pagination";
import { InspectionFilters } from "@/components/organisms/inspection-filters";
import { InspectionList } from "@/components/organisms/inspection-list";
import { QueryError } from "@/components/organisms/query-error";
import { useInspections } from "@/hooks/api/gestao/inspections/useInspections";
import { useInspectionFilters } from "@/hooks/ui/useInspectionFilters";

export function InspectionsPage() {
  const { filters, setSearch, setType, setPerformedBy, setPage } =
    useInspectionFilters();
  const inspections = useInspections(filters);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Vistorias" />
      <InspectionFilters
        filters={filters}
        onSearch={setSearch}
        onTypeChange={setType}
        onPerformedByChange={setPerformedBy}
      />
      {inspections.isError ? (
        <QueryError
          error={inspections.error}
          onRetry={() => inspections.refetch()}
        />
      ) : (
        <InspectionList
          inspections={inspections.data?.items}
          isLoading={inspections.isPending}
          isRefreshing={inspections.isPlaceholderData}
        />
      )}
      {inspections.data && inspections.data.total > 0 && (
        <Pagination
          page={inspections.data.page}
          pageSize={inspections.data.pageSize}
          total={inspections.data.total}
          onPageChange={setPage}
        />
      )}
    </Box>
  );
}
