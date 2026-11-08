import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { portalWritesService } from "@/services/api/cliente/portal-writes.service";

export type MaintenanceAttachItem = { file: File; categoryId: string };

/** One file on a maintenance the renter registered; the rental page refreshes. */
export function useAttachMaintenanceDocument(
  rentalId: string,
  maintenanceId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, categoryId }: MaintenanceAttachItem) =>
      portalWritesService.attachMaintenanceDocument(
        rentalId,
        maintenanceId,
        file,
        categoryId,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.portal.rentalSections(rentalId),
      }),
  });
}
