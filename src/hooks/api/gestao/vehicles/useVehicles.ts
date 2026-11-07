import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { vehiclesService } from "@/services/api/gestao/vehicles.service";
import type { VehicleFilters } from "@/types/vehicle";

export function useVehicles(filters: VehicleFilters) {
  return useQuery({
    queryKey: queryKeys.vehicles.list(filters),
    queryFn: () => vehiclesService.list(filters),
    // Keep the current page on screen while the next one loads (no flicker).
    placeholderData: keepPreviousData,
  });
}
