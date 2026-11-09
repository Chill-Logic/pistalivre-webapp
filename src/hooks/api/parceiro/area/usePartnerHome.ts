import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { partnerAreaService } from "@/services/api/parceiro/partner-area.service";

/** Contracts, motorcycles and current rentals; also the partner's profile. */
export function usePartnerHome() {
  return useQuery({
    queryKey: queryKeys.partnerArea.home(),
    queryFn: partnerAreaService.home,
  });
}
