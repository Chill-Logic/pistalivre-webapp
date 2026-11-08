import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { portalWritesService } from "@/services/api/cliente/portal-writes.service";

/** Photos and checks the rental's vehicle type asks for. */
export function useInspectionRequirements(rentalId: string) {
  return useQuery({
    queryKey: queryKeys.portal.inspectionRequirements(rentalId),
    queryFn: () => portalWritesService.inspectionRequirements(rentalId),
    staleTime: 5 * 60_000,
  });
}
