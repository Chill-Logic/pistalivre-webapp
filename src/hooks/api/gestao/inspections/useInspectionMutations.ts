import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { inspectionsService } from "@/services/api/gestao/inspections.service";
import type { InspectionCreateInput } from "@/types/inspection";

/** The lists, and the vehicle (its current km) and rental pages that show them. */
function useRefreshInspections() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.inspections.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
  };
}

/** A new inspection by the staff (all files in one request). */
export function useCreateInspection() {
  const refresh = useRefreshInspections();
  return useMutation({
    mutationFn: (input: InspectionCreateInput) =>
      inspectionsService.create(input),
    onSuccess: () => {
      refresh();
      toast.success("Vistoria registrada");
    },
  });
}

/** Deletes the inspection and its photos. */
export function useDeleteInspection(id: string) {
  const queryClient = useQueryClient();
  const refresh = useRefreshInspections();
  return useMutation({
    mutationFn: () => inspectionsService.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.inspections.detail(id) });
      refresh();
      toast.success("Vistoria excluída");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
