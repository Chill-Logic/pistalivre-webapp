import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { financeService } from "@/services/api/gestao/finance.service";

export function useFinanceToCollect() {
  return useQuery({
    queryKey: queryKeys.finance.toCollect(),
    queryFn: financeService.toCollect,
  });
}
