import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { billingRulesService } from "@/services/api/gestao/billing-rules.service";

export function useBillingRules() {
  return useQuery({
    queryKey: queryKeys.billingRules(),
    queryFn: billingRulesService.get,
    staleTime: 60 * 60 * 1000,
  });
}
