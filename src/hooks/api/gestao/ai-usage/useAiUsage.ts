import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { aiUsageService } from "@/services/api/gestao/ai-usage.service";
import type { AiUsageFilters } from "@/types/ai-usage";

/** The month's totals and rankings; switching months keeps the old one faded. */
export function useAiUsageSummary(month: string, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.aiUsage.summary(month),
    queryFn: () => aiUsageService.summary(month),
    placeholderData: keepPreviousData,
    enabled,
  });
  return { ...query, isRefreshing: query.isFetching && !query.isPending };
}

/** The month's calls: pages on the desktop, 10 by 10 on the phone. */
export function useAiUsageList(filters: AiUsageFilters, isDesktop: boolean) {
  return usePagedList({
    baseKey: queryKeys.aiUsage.all,
    filters,
    fetch: (current) => aiUsageService.list(current),
    isDesktop,
  });
}
