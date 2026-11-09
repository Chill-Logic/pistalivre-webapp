import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { isNotFound } from "@/helpers/api-error";
import { partnerAreaService } from "@/services/api/parceiro/partner-area.service";

/** A rental of a partner's motorcycle, with the rent's situation ready. */
export function usePartnerRental(id: string) {
  return useQuery({
    queryKey: queryKeys.partnerArea.rental(id),
    queryFn: () => partnerAreaService.rental(id),
    enabled: Boolean(id),
    retry: (count, error) => !isNotFound(error) && count < 2,
  });
}
