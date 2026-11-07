import { useMutation } from "@tanstack/react-query";
import { cepService } from "@/services/api/comum/cep.service";

/** Fetch an address by CEP on demand (when the 8 digits are typed). */
export function useCepLookup() {
  return useMutation({ mutationFn: cepService.lookup });
}
