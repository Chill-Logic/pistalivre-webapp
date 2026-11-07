import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { vehiclesService } from "@/services/api/gestao/vehicles.service";

export function useVehicle(id: string) {
  return useQuery({
    queryKey: queryKeys.vehicles.detail(id),
    queryFn: () => vehiclesService.get(id),
  });
}
