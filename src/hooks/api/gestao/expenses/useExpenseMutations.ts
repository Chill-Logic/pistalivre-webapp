import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { documentsService } from "@/services/api/gestao/documents.service";
import { expensesService } from "@/services/api/gestao/expenses.service";
import type { ExpenseInput } from "@/types/expense";

/**
 * A write changes the month, the record (receipts arrive after it), the
 * cost's history and the dashboard.
 */
function useRefreshExpenses() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  };
}

/**
 * Records (or edits) a month/one-off, then sends the receipts one by one —
 * they belong to the expense, so they go after it exists. A receipt that
 * fails doesn't undo the record: it says so.
 */
export function useSaveExpense(expenseId?: string) {
  const refresh = useRefreshExpenses();
  return useMutation({
    mutationFn: async ({
      input,
      key,
      receipts,
    }: {
      input: ExpenseInput;
      key: string;
      receipts: File[];
    }) => {
      const saved = expenseId
        ? await expensesService.update(expenseId, input)
        : await expensesService.create(input, key);
      let failed = 0;
      for (const file of receipts) {
        try {
          await documentsService.upload({ type: "EXPENSE", id: saved.id }, file);
        } catch {
          failed += 1;
        }
      }
      return { expense: saved, failed };
    },
    onSuccess: ({ failed }) => {
      refresh();
      if (failed > 0) {
        toast.warning(
          `Lançamento salvo, mas ${failed === 1 ? "1 comprovante não subiu" : `${failed} comprovantes não subiram`}. Anexe de novo.`,
        );
      } else {
        toast.success(expenseId ? "Lançamento atualizado" : "Lançamento registrado");
      }
    },
  });
}

export function useDeleteExpense() {
  const refresh = useRefreshExpenses();
  return useMutation({
    mutationFn: (id: string) => expensesService.remove(id),
    onSuccess: () => {
      refresh();
      toast.success("Lançamento excluído");
    },
  });
}
