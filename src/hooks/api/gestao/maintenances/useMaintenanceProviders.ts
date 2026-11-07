import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { maintenancesService } from "@/services/api/gestao/maintenances.service";

/** Workshops already used, as suggestions for the provider field. */
export function useMaintenanceProviders() {
  return useQuery({
    queryKey: queryKeys.maintenances.providers(),
    queryFn: () => maintenancesService.providers(),
    staleTime: 5 * 60_000,
  });
}
