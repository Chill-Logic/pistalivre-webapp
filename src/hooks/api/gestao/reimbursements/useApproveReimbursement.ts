import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { reimbursementsService } from "@/services/api/gestao/reimbursements.service";
import type {
  MarkReimbursementPaidInput,
  ReimbursementApprovalLink,
} from "@/types/staff-reimbursement";

type ApproveVariables = {
  link: ReimbursementApprovalLink;
  /** "Já paguei por fora": records the payment right after approving. */
  paid: MarkReimbursementPaidInput | null;
};

/**
 * Approves (with the maintenance it pays, or "not a maintenance") and, when
 * the pix was already sent by hand, records the payment too. If only the
 * payment fails, the approval stays and the toast says so.
 */
export function useApproveReimbursement(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ link, paid }: ApproveVariables) => {
      const approved = await reimbursementsService.approve(id, link);
      let paidFailed = false;
      if (paid) {
        try {
          await reimbursementsService.markPaid(id, paid);
        } catch {
          paidFailed = true;
        }
      }
      return { approved, paid: Boolean(paid), paidFailed };
    },
    onSuccess: ({ paid, paidFailed }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reimbursements.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenances.all });
      if (paidFailed) {
        toast.warning(
          "Reembolso aprovado, mas o pagamento não foi registrado. Use “Marcar como pago”.",
        );
      } else {
        toast.success(
          paid
            ? "Reembolso aprovado e marcado como pago."
            : "Reembolso aprovado. Falta marcar como pago depois do pix.",
        );
      }
    },
  });
}
