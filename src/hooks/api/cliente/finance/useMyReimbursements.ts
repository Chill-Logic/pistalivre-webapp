import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { portalService } from "@/services/api/cliente/portal.service";

export function useMyReimbursements() {
  return useQuery({
    queryKey: queryKeys.portal.reimbursements(),
    queryFn: portalService.reimbursements,
  });
}
