import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { reimbursementsService } from "@/services/api/gestao/reimbursements.service";

export function useStaffReimbursements() {
  return useQuery({
    queryKey: queryKeys.reimbursements.staff(),
    queryFn: reimbursementsService.list,
  });
}
