import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { rentalBillingKey } from "@/helpers/billing";
import { billingService } from "@/services/api/gestao/billing.service";
import type { BillingPeriod } from "@/types/billing";

/** The rental's billing view; `period` narrows only the reconciliation. */
export function useRentalBilling(
  rentalId: string,
  period: BillingPeriod | null = null,
) {
  return useQuery({
    queryKey: rentalBillingKey(rentalId, period),
    queryFn: () => billingService.get(rentalId, period ?? undefined),
    placeholderData: keepPreviousData,
  });
}
