import { PageHeader } from "@/components/molecules/page-header";
import { Pagination } from "@/components/molecules/pagination";
import { QueryError } from "@/components/organisms/query-error";
import { VehicleFilters } from "@/components/organisms/vehicle-filters";
import { VehicleList } from "@/components/organisms/vehicle-list";
import { useVehicles } from "@/hooks/api/vehicles/useVehicles";
import { useVehicleTypes } from "@/hooks/api/vehicles/useVehicleTypes";
import { useVehicleFilters } from "@/hooks/ui/useVehicleFilters";

export function VehiclesPage() {
  const { filters, setSearch, setType, setStatus, setPage } =
    useVehicleFilters();
  const vehicles = useVehicles(filters);
  const types = useVehicleTypes();

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader title="Veículos" description="A frota da locadora." />
      <VehicleFilters
        filters={filters}
        types={types.data ?? []}
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
    </div>
  );
}
