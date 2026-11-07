import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { inspectionsService } from "@/services/api/gestao/inspections.service";
import type { InspectionFilters } from "@/types/inspection";

export function useInspections(filters: InspectionFilters) {
  return useQuery({
    queryKey: queryKeys.inspections.list(filters),
    queryFn: () => inspectionsService.list(filters),
    placeholderData: keepPreviousData,
  });
}

/** The list page: pages on the desktop, infinite (10 by 10) on the phone. */
export function useInspectionList(
  filters: InspectionFilters,
  isDesktop: boolean,
) {
  return usePagedList({
    baseKey: queryKeys.inspections.all,
    filters,
    fetch: (current) => inspectionsService.list(current),
    isDesktop,
  });
}
