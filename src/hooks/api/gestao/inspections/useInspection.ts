import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { inspectionsService } from "@/services/api/gestao/inspections.service";

export function useInspection(id: string) {
  return useQuery({
    queryKey: queryKeys.inspections.detail(id),
    queryFn: () => inspectionsService.get(id),
  });
}
