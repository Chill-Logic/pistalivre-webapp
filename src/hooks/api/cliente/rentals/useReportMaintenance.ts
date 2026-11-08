import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { portalWritesService } from "@/services/api/cliente/portal-writes.service";
import type { MaintenanceReportInput } from "@/types/portal";

/** A maintenance the renter paid; it then offers "Pedir reembolso". */
export function useReportMaintenance(rentalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MaintenanceReportInput) =>
      portalWritesService.reportMaintenance(rentalId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.portal.rentalSections(rentalId),
      });
      toast.success(
        "Manutenção registrada. Agora você pode pedir o reembolso.",
      );
    },
  });
}
