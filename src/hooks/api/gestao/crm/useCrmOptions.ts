import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { crmService } from "@/services/api/gestao/crm.service";

/** Origins, stages, activity types and loss reasons — they rarely change. */
export function useCrmOptions() {
  return useQuery({
    queryKey: queryKeys.crm.options(),
    queryFn: crmService.options,
    staleTime: 60 * 60 * 1000,
  });
}
