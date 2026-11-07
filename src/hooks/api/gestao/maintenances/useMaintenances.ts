import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { maintenancesService } from "@/services/api/gestao/maintenances.service";
import type { MaintenanceFilters } from "@/types/maintenance";

export function useMaintenances(filters: MaintenanceFilters) {
  return useQuery({
    queryKey: queryKeys.maintenances.list(filters),
    queryFn: () => maintenancesService.list(filters),
    placeholderData: keepPreviousData,
  });
}
