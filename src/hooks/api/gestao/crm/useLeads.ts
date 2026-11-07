import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { crmService } from "@/services/api/gestao/crm.service";
import type { LeadFilters } from "@/types/crm";

/** The list page: pages on the desktop, infinite (10 by 10) on the phone. */
export function useLeadList(filters: LeadFilters, isDesktop: boolean) {
  return usePagedList({
    baseKey: queryKeys.crm.all,
    filters,
    fetch: (current) => crmService.leads(current),
    isDesktop,
  });
}
