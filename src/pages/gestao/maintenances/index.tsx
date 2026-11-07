import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { ROUTES } from "@/constants/routes";
import { PageHeader } from "@/components/molecules/page-header";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { MaintenanceFilters } from "@/components/organisms/maintenance-filters";
import { MaintenanceList } from "@/components/organisms/maintenance-list";
import { MaintenanceTable } from "@/components/organisms/maintenance-table";
import { ListFooter } from "@/components/organisms/list-footer";
import { QueryError } from "@/components/organisms/query-error";
import { useMaintenanceList } from "@/hooks/api/gestao/maintenances/useMaintenances";
import { useListView } from "@/hooks/ui/useListView";
import { useMaintenanceFilters } from "@/hooks/ui/useMaintenanceFilters";

export function MaintenancesPage() {
  const { filters, setSearch, setType, setPage, setPageSize } =
    useMaintenanceFilters();
  const { view, setView, isDesktop } = useListView();
  const maintenances = useMaintenanceList(filters, isDesktop);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Manutenções"
        actions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <Button asChild>
              <Link to={ROUTES.maintenanceNew}>
                <Plus />
                Nova manutenção
              </Link>
            </Button>
          </>
        }
      />
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
      ) : view === "tabela" ? (
        <MaintenanceTable
          maintenances={maintenances.items}
          isLoading={maintenances.isPending}
          isRefreshing={maintenances.isRefreshing}
        />
      ) : (
        <MaintenanceList
          maintenances={maintenances.items}
          isLoading={maintenances.isPending}
          isRefreshing={maintenances.isRefreshing}
        />
      )}
      <ListFooter
        result={maintenances}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Box>
  );
}
