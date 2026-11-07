import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { projectionsService } from "@/services/api/gestao/projections.service";

/** Starting scenario, read once per opened link (edits stay local). */
export function useProjectionSeed(sim: string) {
  return useQuery({
    queryKey: queryKeys.projections.seed(sim),
    queryFn: () => projectionsService.seed(sim),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
