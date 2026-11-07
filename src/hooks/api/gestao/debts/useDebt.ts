import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { debtsService } from "@/services/api/gestao/debts.service";

export function useDebt(id: string) {
  return useQuery({
    queryKey: queryKeys.debts.detail(id),
    queryFn: () => debtsService.get(id),
  });
}
