import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { financeService } from "@/services/api/gestao/finance.service";

export function useFinanceBalances() {
  return useQuery({
    queryKey: queryKeys.finance.balances(),
    queryFn: financeService.balances,
  });
}
