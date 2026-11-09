import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { isNotFound } from "@/helpers/api-error";
import { partnerAreaService } from "@/services/api/parceiro/partner-area.service";

/** One of the partner's vehicles (404 = not theirs, never retried). */
export function usePartnerVehicle(id: string) {
  return useQuery({
    queryKey: queryKeys.partnerArea.vehicle(id),
    queryFn: () => partnerAreaService.vehicle(id),
    enabled: Boolean(id),
    retry: (count, error) => !isNotFound(error) && count < 2,
  });
}
