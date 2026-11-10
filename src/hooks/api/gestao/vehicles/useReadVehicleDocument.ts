import { useMutation } from "@tanstack/react-query";
import { shrinkImage } from "@/helpers/image";
import { vehiclesService } from "@/services/api/gestao/vehicles.service";

/**
 * "Preencher pelo documento": the photo goes shrunk (the API takes images up
 * to 5 MB; a phone photo is bigger and the AI reads it as well at 2000 px).
 * Errors are left to the caller, which shows the API's message.
 */
export function useReadVehicleDocument() {
  return useMutation({
    mutationFn: async (file: File) =>
      vehiclesService.readDocument(await shrinkImage(file)),
  });
}
