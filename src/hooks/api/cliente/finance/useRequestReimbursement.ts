import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { portalWritesService } from "@/services/api/cliente/portal-writes.service";
import type { ReimbursementRequestInput } from "@/types/portal";

type Variables = ReimbursementRequestInput & { receipts: File[] };

/**
 * Creates the request, then sends the receipts one by one. A receipt that
 * fails does not undo the request: the toast says so.
 */
export function useRequestReimbursement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ receipts, ...input }: Variables) => {
      const created = await portalWritesService.requestReimbursement(input);
      let failed = 0;
      for (const file of receipts) {
        try {
          await portalWritesService.attachReimbursementReceipt(
            created.id,
            file,
          );
        } catch {
          failed += 1;
        }
      }
      return { failed };
    },
    onSuccess: ({ failed }) => {
      // Home list, rental sections and the maintenance badge all change.
      queryClient.invalidateQueries({ queryKey: queryKeys.portal.all });
      if (failed > 0) {
        toast.warning(
          `Pedido enviado, mas ${failed === 1 ? "1 comprovante não subiu" : `${failed} comprovantes não subiram`}. A locadora pode pedir de novo.`,
        );
      } else {
        toast.success("Pedido de reembolso enviado. A locadora vai analisar.");
      }
    },
  });
}
