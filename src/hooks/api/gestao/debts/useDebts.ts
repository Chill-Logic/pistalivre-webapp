import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { debtsService } from "@/services/api/gestao/debts.service";

export function useDebts() {
  return useQuery({
    queryKey: queryKeys.debts.list(),
    queryFn: debtsService.list,
  });
}
