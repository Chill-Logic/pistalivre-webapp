import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { vehiclesService } from "@/services/api/gestao/vehicles.service";
import type { VehicleInput } from "@/types/vehicle";

/**
 * Create (no id) or replace (id) a vehicle. Errors are left to the form, which
 * maps the API's field messages onto the inputs.
 */
export function useSaveVehicle(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VehicleInput) =>
      id ? vehiclesService.update(id, input) : vehiclesService.create(input),
    onSuccess: () => {
      // The POST/PUT answer without documents: refetch the detail instead of
      // seeding it (seeding crashed the detail page on its documents list).
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      // A new brand/model/year may have been created.
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicleFormOptions.all,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success(id ? "Veículo atualizado" : "Veículo cadastrado");
    },
  });
}
