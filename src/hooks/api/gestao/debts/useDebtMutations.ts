import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { debtsService } from "@/services/api/gestao/debts.service";
import { documentsService } from "@/services/api/gestao/documents.service";
import type { DebtDetail, DebtInput, DebtPaymentInput } from "@/types/debt";

/** The detail comes back on every write: it replaces the cache. */
function useStoreDebt() {
  const queryClient = useQueryClient();
  return (debt: DebtDetail) => {
    queryClient.setQueryData(queryKeys.debts.detail(debt.id), debt);
    // Every list (desktop pages and the phone's infinite one), not the detail.
    queryClient.invalidateQueries({
      queryKey: queryKeys.debts.all,
      predicate: (query) => query.queryKey[1] !== "detail",
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  };
}

/**
 * Records a payment, then sends the receipts one by one (they belong to the
 * payment, so they can only go after it exists). A receipt that fails does
 * not undo the payment: it says so.
 */
export function useAddDebtPayment(debtId: string) {
  const store = useStoreDebt();
  return useMutation({
    mutationFn: async ({
      input,
      key,
      receipts,
    }: {
      input: DebtPaymentInput;
      key: string;
      receipts: File[];
    }) => {
      const { paymentId, debt } = await debtsService.addPayment(
        debtId,
        input,
        key,
      );
      let failed = 0;
      for (const file of receipts) {
        try {
          await documentsService.upload(
            { type: "DEBT_PAYMENT", id: paymentId },
            file,
          );
        } catch {
          failed += 1;
        }
      }
      return { debt, failed };
    },
    onSuccess: ({ debt, failed }) => {
      store(debt);
      if (failed > 0) {
        toast.warning(
          `Pagamento registrado, mas ${failed === 1 ? "1 comprovante não subiu" : `${failed} comprovantes não subiram`}. Anexe de novo no pagamento.`,
        );
      } else {
        toast.success("Pagamento registrado");
      }
    },
  });
}

export function useDeleteDebtPayment() {
  const store = useStoreDebt();
  return useMutation({
    mutationFn: (paymentId: string) => debtsService.removePayment(paymentId),
    onSuccess: (debt) => {
      store(debt);
      toast.success("Pagamento excluído");
    },
  });
}

/** Create (no id) or replace (id). Errors stay with the form. */
export function useSaveDebt(id?: string) {
  const store = useStoreDebt();
  return useMutation({
    mutationFn: (input: DebtInput) =>
      id ? debtsService.update(id, input) : debtsService.create(input),
    onSuccess: (debt) => {
      store(debt);
      toast.success(id ? "Dívida atualizada" : "Dívida cadastrada");
    },
  });
}

export function useDeleteDebt(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => debtsService.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.debts.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.debts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("Dívida excluída");
    },
  });
}
