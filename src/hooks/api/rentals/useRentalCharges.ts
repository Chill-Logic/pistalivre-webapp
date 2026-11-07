import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { rentalsService } from "@/services/api/rentals.service";

/** Read-only: issuing, settling and editing charges stay in the old app for now. */
export function useRentalCharges(id: string) {
  return useQuery({
    queryKey: queryKeys.rentals.charges(id),
    queryFn: () => rentalsService.charges(id),
  });
}
