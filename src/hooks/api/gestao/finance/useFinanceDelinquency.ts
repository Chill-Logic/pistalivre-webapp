import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { financeService } from "@/services/api/gestao/finance.service";

export function useFinanceDelinquency() {
  return useQuery({
    queryKey: queryKeys.finance.delinquency(),
    queryFn: financeService.delinquency,
  });
}
