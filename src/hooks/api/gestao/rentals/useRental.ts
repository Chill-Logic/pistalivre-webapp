import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { rentalsService } from "@/services/api/gestao/rentals.service";

export function useRental(id: string) {
  return useQuery({
    queryKey: queryKeys.rentals.detail(id),
    queryFn: () => rentalsService.get(id),
    enabled: Boolean(id),
  });
}
