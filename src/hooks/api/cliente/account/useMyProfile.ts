import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { portalService } from "@/services/api/cliente/portal.service";

/** The renter's own CPF, e-mail and phone (to start the pix key from). */
export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.portal.profile(),
    queryFn: portalService.profile,
    staleTime: 10 * 60_000,
  });
}
