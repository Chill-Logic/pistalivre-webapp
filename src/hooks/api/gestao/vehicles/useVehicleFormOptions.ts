import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { vehiclesService } from "@/services/api/gestao/vehicles.service";

/** Types, categories, brands, models and years for the vehicle form. */
export function useVehicleFormOptions() {
  return useQuery({
    queryKey: queryKeys.vehicleFormOptions.all,
    queryFn: vehiclesService.formOptions,
    staleTime: 5 * 60_000,
  });
}
