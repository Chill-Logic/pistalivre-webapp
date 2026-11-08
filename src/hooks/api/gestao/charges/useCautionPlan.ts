import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { chargesService } from "@/services/api/gestao/charges.service";

/** The deposit the rental implies; fetched when the dialog asks for it. */
export function useCautionPlan(rentalId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.rentals.cautionPlan(rentalId),
    queryFn: () => chargesService.cautionPlan(rentalId),
    enabled,
  });
}
