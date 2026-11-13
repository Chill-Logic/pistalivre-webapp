import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { searchService } from "@/services/api/gestao/search.service";
import type { SearchParams } from "@/types/search";

/**
 * The server side of the Ctrl+K. The caller debounces `q`; the previous
 * request is cancelled (react-query's signal) and the last answer stays on
 * screen while the next one loads (no flicker between keystrokes).
 */
export function useUniversalSearch(params: SearchParams, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.search.query(params),
    queryFn: ({ signal }) => searchService.search(params, signal),
    enabled: enabled && params.q.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}
