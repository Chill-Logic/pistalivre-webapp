import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { portalService } from "@/services/api/cliente/portal.service";

export function useMyRental(id: string) {
  return useQuery({
    queryKey: queryKeys.portal.rental(id),
    queryFn: () => portalService.rental(id),
  });
}
