import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { reimbursementsService } from "@/services/api/gestao/reimbursements.service";

/** Maintenances of the request's vehicle it may pay (loaded when the dialog opens). */
export function useReimbursementMaintenanceCandidates(
  id: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.reimbursements.candidates(id),
    queryFn: () => reimbursementsService.maintenanceCandidates(id),
    enabled,
  });
}
