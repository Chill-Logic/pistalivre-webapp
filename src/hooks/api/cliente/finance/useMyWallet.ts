import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { portalService } from "@/services/api/cliente/portal.service";

export function useMyWallet() {
  return useQuery({
    queryKey: queryKeys.portal.wallet(),
    queryFn: portalService.wallet,
  });
}
