import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { plansService } from "@/services/api/gestao/plans.service";

export function usePlan(id: string) {
  return useQuery({
    queryKey: queryKeys.plans.detail(id),
    queryFn: () => plansService.get(id),
    enabled: Boolean(id),
  });
}
