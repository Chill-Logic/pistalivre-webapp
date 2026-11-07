import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { vehiclesService } from "@/services/api/vehicles.service";

/** Catalog data: changes rarely, cached for the session. */
export function useVehicleTypes() {
  return useQuery({
    queryKey: queryKeys.vehicleTypes.all,
    queryFn: vehiclesService.listTypes,
    staleTime: Infinity,
  });
}
