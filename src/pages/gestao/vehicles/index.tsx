import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { PageHeader } from "@/components/molecules/page-header";
import { Pagination } from "@/components/molecules/pagination";
import { QueryError } from "@/components/organisms/query-error";
import { VehicleFilters } from "@/components/organisms/vehicle-filters";
import { VehicleList } from "@/components/organisms/vehicle-list";
import { useVehicles } from "@/hooks/api/gestao/vehicles/useVehicles";
import { useVehicleTypes } from "@/hooks/api/gestao/vehicles/useVehicleTypes";
import { ROUTES } from "@/constants/routes";
import { useVehicleFilters } from "@/hooks/ui/useVehicleFilters";

export function VehiclesPage() {
  const { filters, setSearch, setType, setStatus, setPage } =
    useVehicleFilters();
  const vehicles = useVehicles(filters);
  const types = useVehicleTypes();

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Veículos"
        actions={
          <Button asChild>
            <Link to={ROUTES.vehicleNew}>
              <Plus />
              Novo veículo
            </Link>
          </Button>
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
      ) : (
        <VehicleList
          vehicles={vehicles.data?.items}
          isLoading={vehicles.isPending}
          isRefreshing={vehicles.isPlaceholderData}
        />
      )}
      {vehicles.data && vehicles.data.total > 0 && (
        <Pagination
          page={vehicles.data.page}
          pageSize={vehicles.data.pageSize}
          total={vehicles.data.total}
          onPageChange={setPage}
        />
      )}
    </Box>
  );
}
