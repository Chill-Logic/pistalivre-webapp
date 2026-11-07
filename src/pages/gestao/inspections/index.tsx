import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { InspectionFilters } from "@/components/organisms/inspection-filters";
import { InspectionList } from "@/components/organisms/inspection-list";
import { InspectionTable } from "@/components/organisms/inspection-table";
import { ListFooter } from "@/components/organisms/list-footer";
import { QueryError } from "@/components/organisms/query-error";
import { useInspectionList } from "@/hooks/api/gestao/inspections/useInspections";
import { useListView } from "@/hooks/ui/useListView";
import { useInspectionFilters } from "@/hooks/ui/useInspectionFilters";

export function InspectionsPage() {
  const { filters, setSearch, setType, setPerformedBy, setPage, setPageSize } =
    useInspectionFilters();
  const { view, setView, isDesktop } = useListView();
  const inspections = useInspectionList(filters, isDesktop);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Vistorias"
        actions={<ViewToggle view={view} onChange={setView} />}
      />
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
      ) : view === "tabela" ? (
        <InspectionTable
          inspections={inspections.items}
          isLoading={inspections.isPending}
          isRefreshing={inspections.isRefreshing}
        />
      ) : (
        <InspectionList
          inspections={inspections.items}
          isLoading={inspections.isPending}
          isRefreshing={inspections.isRefreshing}
        />
      )}
      <ListFooter
        result={inspections}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Box>
  );
}
