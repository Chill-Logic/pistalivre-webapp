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

/**
 * Create (no id) or replace (id), then send the chosen attachments one per
 * request (they belong to the debt, so only after it exists). A file that
 * fails doesn't undo the debt: it says so. Errors stay with the form.
 */
export function useSaveDebt(id?: string) {
  const store = useStoreDebt();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      input,
      files = [],
    }: {
      input: DebtInput;
      files?: File[];
    }) => {
      let debt = id
        ? await debtsService.update(id, input)
        : await debtsService.create(input);
      let failed = 0;
      for (const file of files) {
        try {
          await documentsService.upload({ type: "DEBT", id: debt.id }, file);
        } catch {
          failed += 1;
        }
      }
      // The documents only show in a fresh read of the debt.
      if (files.length > failed) debt = await debtsService.get(debt.id);
      return { debt, failed };
    },
    onSuccess: ({ debt, failed }) => {
      store(debt);
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      toast.success(id ? "Dívida atualizada" : "Dívida cadastrada");
      if (failed > 0) {
        toast.warning(
          `${failed === 1 ? "1 anexo não foi enviado" : `${failed} anexos não foram enviados`}. Envie de novo pela página da dívida.`,
        );
      }
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
