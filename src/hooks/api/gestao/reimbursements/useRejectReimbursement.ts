import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { reimbursementsService } from "@/services/api/gestao/reimbursements.service";
import type { RejectReimbursementInput } from "@/types/staff-reimbursement";

/** Rejects a pending request; errors stay with the dialog (fields). */
export function useRejectReimbursement(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RejectReimbursementInput) =>
      reimbursementsService.reject(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reimbursements.all });
      toast.success(
        "Reembolso recusado. O cliente vê o motivo e pode pedir de novo.",
      );
    },
  });
}
