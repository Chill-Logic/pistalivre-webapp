import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { rentalsService } from "@/services/api/gestao/rentals.service";
import type { RentalFilters } from "@/types/rental";

export function useRentals(filters: RentalFilters) {
  return useQuery({
    queryKey: queryKeys.rentals.list(filters),
    queryFn: () => rentalsService.list(filters),
    placeholderData: keepPreviousData,
  });
}

/** The list page: pages on the desktop, infinite (10 by 10) on the phone. */
export function useRentalList(filters: RentalFilters, isDesktop: boolean) {
  return usePagedList({
    baseKey: queryKeys.rentals.all,
    filters,
    fetch: (current) => rentalsService.list(current),
    isDesktop,
  });
}
