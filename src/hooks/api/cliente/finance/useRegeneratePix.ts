import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";

/**
 * "Regerar" an expired pix: reading the charges again makes the API fetch a
 * fresh QR from Asaas (home list and the rental pages on screen).
 */
export function useRegeneratePix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.portal.charges() }),
        queryClient.refetchQueries({
          queryKey: queryKeys.portal.allRentalSections(),
        }),
      ]),
    onError: (error) => toast.error(errorMessage(error)),
  });
}
