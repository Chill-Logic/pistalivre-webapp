import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { billingService } from "@/services/api/gestao/billing.service";

/** The 1st rent charge, whole or prorated, as the server computes it. */
export function useFirstChargePreview(
  rentalId: string,
  firstDueDate: string | null,
) {
  return useQuery({
    queryKey: [
      ...queryKeys.rentals.all,
      "first-charge-preview",
      rentalId,
      firstDueDate,
    ],
    queryFn: () => billingService.previewFirstCharge(rentalId, firstDueDate!),
    enabled: firstDueDate !== null,
    placeholderData: keepPreviousData,
    retry: false,
  });
}
