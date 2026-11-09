import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { expensesService } from "@/services/api/gestao/expenses.service";

/** The month's bills; switching months keeps the old one on screen (faded). */
export function useExpenseMonth(month: string) {
  const query = useQuery({
    queryKey: queryKeys.expenses.month(month),
    queryFn: () => expensesService.month(month),
    placeholderData: keepPreviousData,
  });
  return { ...query, isRefreshing: query.isFetching && !query.isPending };
}
