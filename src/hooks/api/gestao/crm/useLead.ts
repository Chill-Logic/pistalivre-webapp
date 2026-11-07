import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { crmService } from "@/services/api/gestao/crm.service";

export function useLead(id: string) {
  return useQuery({
    queryKey: queryKeys.crm.lead(id),
    queryFn: () => crmService.lead(id),
  });
}
