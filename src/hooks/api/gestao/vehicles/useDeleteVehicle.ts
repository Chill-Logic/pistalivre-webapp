import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { vehiclesService } from "@/services/api/gestao/vehicles.service";

export function useDeleteVehicle(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => vehiclesService.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.vehicles.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("Veículo excluído");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
