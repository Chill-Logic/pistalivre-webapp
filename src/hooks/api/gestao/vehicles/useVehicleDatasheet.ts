import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage } from "@/helpers/api-error";
import { openBlobInNewTab } from "@/helpers/files";
import { vehiclesService } from "@/services/api/gestao/vehicles.service";

/** Opens the vehicle's "Ficha técnica" PDF in a new tab. */
export function useVehicleDatasheet() {
  return useMutation({
    mutationFn: (vehicleId: string) =>
      openBlobInNewTab(() => vehiclesService.datasheet(vehicleId)),
    onError: (error) => toast.error(errorMessage(error)),
  });
}
