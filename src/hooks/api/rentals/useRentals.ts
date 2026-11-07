import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { rentalsService } from "@/services/api/rentals.service";
import type { RentalFilters } from "@/types/rental";

export function useRentals(filters: RentalFilters) {
  return useQuery({
    queryKey: queryKeys.rentals.list(filters),
    queryFn: () => rentalsService.list(filters),
    placeholderData: keepPreviousData,
  });
}
