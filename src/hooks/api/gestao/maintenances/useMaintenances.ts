import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { maintenancesService } from "@/services/api/gestao/maintenances.service";
import type { MaintenanceFilters } from "@/types/maintenance";

export function useMaintenances(filters: MaintenanceFilters) {
  return useQuery({
    queryKey: queryKeys.maintenances.list(filters),
    queryFn: () => maintenancesService.list(filters),
    placeholderData: keepPreviousData,
  });
}

/** The list page: pages on the desktop, infinite (10 by 10) on the phone. */
export function useMaintenanceList(
  filters: MaintenanceFilters,
  isDesktop: boolean,
) {
  return usePagedList({
    baseKey: queryKeys.maintenances.all,
    filters,
    fetch: (current) => maintenancesService.list(current),
    isDesktop,
  });
}
