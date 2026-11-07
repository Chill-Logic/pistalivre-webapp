import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { inspectionsService } from "@/services/api/gestao/inspections.service";
import type { InspectionFilters } from "@/types/inspection";

export function useInspections(filters: InspectionFilters) {
  return useQuery({
    queryKey: queryKeys.inspections.list(filters),
    queryFn: () => inspectionsService.list(filters),
    placeholderData: keepPreviousData,
  });
}
