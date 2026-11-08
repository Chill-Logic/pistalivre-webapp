import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { contractDraftKey } from "@/helpers/contract";
import { customersService } from "@/services/api/gestao/customers.service";
import type { LicenseInput } from "@/types/contract";

/**
 * Saves the customer's CNH (reused by every contract; asked again only when
 * expired). Errors stay with the form (422 per field).
 */
export function useSaveLicense(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LicenseInput) =>
      customersService.saveLicense(customerId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.customers.detail(customerId),
      });
      // A draft that failed for lack of CNH is asked again.
      queryClient.resetQueries({ queryKey: contractDraftKey() });
      toast.success("CNH salva");
    },
  });
}
