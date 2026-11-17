import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { maintenancesService } from "@/services/api/gestao/maintenances.service";
import type { MaintenanceAnalysisFilters } from "@/types/maintenance-analysis";

/** Taxa de manutenção: rows + totals for the filters (keeps the old ones while refetching). */
export function useMaintenanceAnalysis(filters: MaintenanceAnalysisFilters) {
  return useQuery({
    queryKey: queryKeys.maintenances.analysis(filters),
    queryFn: () => maintenancesService.analysis(filters),
    placeholderData: keepPreviousData,
  });
}

/** The maintenances behind one row (opened from the table). */
export function useMaintenanceAnalysisGroup(
  filters: MaintenanceAnalysisFilters,
  key: string | null,
) {
  return useQuery({
    queryKey: queryKeys.maintenances.analysisGroup(filters, key ?? ""),
    queryFn: () => maintenancesService.analysis(filters, key ?? undefined),
    enabled: key != null,
  });
}
