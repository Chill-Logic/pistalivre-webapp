import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { expensesService } from "@/services/api/gestao/expenses.service";

/** A recorded expense with its receipts (`null` id = nothing to fetch). */
export function useExpense(id: string | null) {
  return useQuery({
    queryKey: queryKeys.expenses.detail(id ?? ""),
    queryFn: () => expensesService.get(id ?? ""),
    enabled: Boolean(id),
  });
}
