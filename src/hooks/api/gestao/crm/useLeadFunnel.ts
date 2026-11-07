import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { crmService } from "@/services/api/gestao/crm.service";

export function useLeadFunnel() {
  return useQuery({
    queryKey: queryKeys.crm.funnel(),
    queryFn: crmService.funnel,
  });
}
