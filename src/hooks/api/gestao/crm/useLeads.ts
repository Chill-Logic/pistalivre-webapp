import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { crmService } from "@/services/api/gestao/crm.service";
import type { LeadFilters } from "@/types/crm";

export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: queryKeys.crm.leads(filters),
    queryFn: () => crmService.leads(filters),
    placeholderData: keepPreviousData,
  });
}
