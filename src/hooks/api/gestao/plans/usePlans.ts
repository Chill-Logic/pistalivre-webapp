import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { plansService } from "@/services/api/gestao/plans.service";

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans.all,
    queryFn: plansService.list,
  });
}
