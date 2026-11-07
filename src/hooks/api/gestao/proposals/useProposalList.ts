import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { proposalsService } from "@/services/api/gestao/proposals.service";
import type { ProposalFilters } from "@/types/proposal";

/** The list page: pages on the desktop, infinite (10 by 10) on the phone. */
export function useProposalList(filters: ProposalFilters, isDesktop: boolean) {
  return usePagedList({
    baseKey: queryKeys.proposals.all,
    filters,
    fetch: (current) => proposalsService.list(current),
    isDesktop,
  });
}
