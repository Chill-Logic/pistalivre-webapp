import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { portalService } from "@/services/api/cliente/portal.service";

export function useMyRentalSections(id: string) {
  return useQuery({
    queryKey: queryKeys.portal.rentalSections(id),
    queryFn: () => portalService.rentalSections(id),
  });
}
