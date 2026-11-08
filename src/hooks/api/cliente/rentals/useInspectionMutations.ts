import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { portalWritesService } from "@/services/api/cliente/portal-writes.service";
import type { InspectionSubmitInput } from "@/types/portal";

/** Send an inspection, or delete one the renter made. */
export function useInspectionMutations(rentalId: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.portal.rentalSections(rentalId),
    });

  const send = useMutation({
    mutationFn: (input: InspectionSubmitInput) =>
      portalWritesService.sendInspection(rentalId, input),
    onSuccess: () => {
      refresh();
      toast.success("Vistoria enviada");
    },
  });
  const remove = useMutation({
    mutationFn: (inspectionId: string) =>
      portalWritesService.deleteInspection(rentalId, inspectionId),
    onSuccess: () => {
      refresh();
      toast.success("Vistoria excluída");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return { send, remove };
}
