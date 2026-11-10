import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { billingService } from "@/services/api/gestao/billing.service";
import type { DueChangeInput } from "@/types/billing";

/** What "Trocar vencimento" would do, as the server computes it. */
export function useDueChangePreview(
  rentalId: string,
  input: DueChangeInput | null,
) {
  return useQuery({
    queryKey: [...queryKeys.rentals.all, "due-change-preview", rentalId, input],
    queryFn: () => billingService.previewDueChange(rentalId, input!),
    enabled: input !== null,
    placeholderData: keepPreviousData,
    retry: false,
  });
}
