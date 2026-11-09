import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { expensesService } from "@/services/api/gestao/expenses.service";

/** A fixed cost's months, newest first. */
export function useSupplierMonths(supplierId: string) {
  const query = useQuery({
    queryKey: queryKeys.suppliers.months(supplierId),
    queryFn: () => expensesService.supplierMonths(supplierId),
  });
  return { ...query, isRefreshing: query.isFetching && !query.isPending };
}
