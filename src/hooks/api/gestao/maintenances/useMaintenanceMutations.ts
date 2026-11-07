import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { documentsService } from "@/services/api/gestao/documents.service";
import { maintenancesService } from "@/services/api/gestao/maintenances.service";
import type { MaintenanceDetail, MaintenanceInput } from "@/types/maintenance";

type SaveVariables = { input: MaintenanceInput; files: File[] };

/**
 * Create (no id) or replace (id), then send the chosen attachments one per
 * request. A failed attachment doesn't undo the maintenance: it is saved,
 * and the file can be sent again from its page.
 */
export function useSaveMaintenance(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ input, files }: SaveVariables) => {
      const saved: MaintenanceDetail = id
        ? await maintenancesService.update(id, input)
        : await maintenancesService.create(input);
      let failed = 0;
      for (const file of files) {
        try {
          await documentsService.upload(
            { type: "MAINTENANCE", id: saved.id },
            file,
          );
        } catch {
          failed += 1;
        }
      }
      return { saved, failed };
    },
    onSuccess: ({ saved, failed }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenances.all });
      // The mileage feeds the vehicle's current km.
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      queryClient.removeQueries({
        queryKey: queryKeys.maintenances.detail(saved.id),
      });
      toast.success(id ? "Manutenção atualizada" : "Manutenção registrada");
      if (failed > 0) {
        toast.warning(
          `${failed} anexo(s) não foram enviados. Envie de novo pela página da manutenção.`,
        );
      }
    },
  });
}

/** Deletes the maintenance and its attachments. */
export function useDeleteMaintenance(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => maintenancesService.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: queryKeys.maintenances.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenances.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      toast.success("Manutenção excluída");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
