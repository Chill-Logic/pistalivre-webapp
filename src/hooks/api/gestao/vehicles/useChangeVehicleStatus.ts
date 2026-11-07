import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { vehiclesService } from "@/services/api/gestao/vehicles.service";
import type { VehicleStatus } from "@/types/vehicle";

export function useChangeVehicleStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: VehicleStatus) =>
      vehiclesService.changeStatus(id, status),
    onSuccess: () => {
      // The PATCH answers without documents: refetch the detail instead of
      // seeding it, and refresh lists/dashboard that count by status.
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("Situação do veículo alterada");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
