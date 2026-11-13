import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { guideService } from "@/services/api/gestao/guide.service";

/** The system's manual; it only changes with a new version of the backend. */
export function useGuide() {
  return useQuery({
    queryKey: queryKeys.guide.all,
    queryFn: () => guideService.get(),
    staleTime: 60 * 60 * 1000,
  });
}
