import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { Pagination } from "@/components/molecules/pagination";
import { MaintenanceFilters } from "@/components/organisms/maintenance-filters";
import { MaintenanceList } from "@/components/organisms/maintenance-list";
import { QueryError } from "@/components/organisms/query-error";
import { useMaintenances } from "@/hooks/api/gestao/maintenances/useMaintenances";
import { useMaintenanceFilters } from "@/hooks/ui/useMaintenanceFilters";

export function MaintenancesPage() {
  const { filters, setSearch, setType, setPage } = useMaintenanceFilters();
  const maintenances = useMaintenances(filters);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Manutenções" />
      <MaintenanceFilters
        filters={filters}
        onSearch={setSearch}
        onTypeChange={setType}
      />
      {maintenances.isError ? (
        <QueryError
          error={maintenances.error}
          onRetry={() => maintenances.refetch()}
        />
      ) : (
        <MaintenanceList
          maintenances={maintenances.data?.items}
          isLoading={maintenances.isPending}
          isRefreshing={maintenances.isPlaceholderData}
        />
      )}
      {maintenances.data && maintenances.data.total > 0 && (
        <Pagination
          page={maintenances.data.page}
          pageSize={maintenances.data.pageSize}
          total={maintenances.data.total}
          onPageChange={setPage}
        />
      )}
    </Box>
  );
}
