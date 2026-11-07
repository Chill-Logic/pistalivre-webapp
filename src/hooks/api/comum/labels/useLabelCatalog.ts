import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { labelsService } from "@/services/api/comum/labels.service";

/** All label maps, loaded once per session (the shell waits for it). */
export function useLabelCatalog() {
  return useQuery({
    queryKey: queryKeys.labels.all,
    queryFn: labelsService.catalog,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
