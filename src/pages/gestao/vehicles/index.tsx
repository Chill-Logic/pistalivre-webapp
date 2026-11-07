import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { PageHeader } from "@/components/molecules/page-header";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { ListFooter } from "@/components/organisms/list-footer";
import { QueryError } from "@/components/organisms/query-error";
import { VehicleFilters } from "@/components/organisms/vehicle-filters";
import { VehicleList } from "@/components/organisms/vehicle-list";
import { VehicleTable } from "@/components/organisms/vehicle-table";
import { useVehicleList } from "@/hooks/api/gestao/vehicles/useVehicles";
import { useVehicleTypes } from "@/hooks/api/gestao/vehicles/useVehicleTypes";
import { ROUTES } from "@/constants/routes";
import { useListView } from "@/hooks/ui/useListView";
import { useVehicleFilters } from "@/hooks/ui/useVehicleFilters";

export function VehiclesPage() {
  const { filters, setSearch, setType, setStatus, setPage, setPageSize } =
    useVehicleFilters();
  const { view, setView, isDesktop } = useListView();
  const vehicles = useVehicleList(filters, isDesktop);
  const types = useVehicleTypes();

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Veículos"
        actions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <Button asChild>
              <Link to={ROUTES.vehicleNew}>
                <Plus />
                Novo veículo
              </Link>
            </Button>
          </>
        }
      />
      <VehicleFilters
        filters={filters}
        types={types.data ?? []}
        isLoadingTypes={types.isPending}
        onSearch={setSearch}
        onTypeChange={setType}
        onStatusChange={setStatus}
      />
      {vehicles.isError ? (
        <QueryError error={vehicles.error} onRetry={() => vehicles.refetch()} />
      ) : view === "tabela" ? (
        <VehicleTable
          vehicles={vehicles.items}
          isLoading={vehicles.isPending}
          isRefreshing={vehicles.isRefreshing}
        />
      ) : (
        <VehicleList
          vehicles={vehicles.items}
          isLoading={vehicles.isPending}
          isRefreshing={vehicles.isRefreshing}
        />
      )}
      <ListFooter
        result={vehicles}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Box>
  );
}
