import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { reimbursementsService } from "@/services/api/gestao/reimbursements.service";
import { documentsService } from "@/services/api/gestao/documents.service";
import type { MarkReimbursementPaidInput } from "@/types/staff-reimbursement";

type MarkPaidVariables = MarkReimbursementPaidInput & { receipts: File[] };

/**
 * Records a refund paid outside the system, then sends the receipts one by
 * one. A receipt that fails does not undo the record: it says so, and the
 * file can be sent again from the documents.
 */
export function useMarkReimbursementPaid(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ receipts, ...input }: MarkPaidVariables) => {
      await reimbursementsService.markPaid(id, input);
      let failed = 0;
      for (const file of receipts) {
        try {
          await documentsService.upload({ type: "REIMBURSEMENT", id }, file);
        } catch {
          failed += 1;
        }
      }
      return { failed };
    },
    onSuccess: ({ failed }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reimbursements.all });
      if (failed > 0) {
        toast.warning(
          `Reembolso marcado como pago, mas ${failed === 1 ? "1 comprovante não subiu" : `${failed} comprovantes não subiram`}. Envie de novo.`,
        );
      } else {
        toast.success("Reembolso marcado como pago.");
      }
    },
  });
}
