import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { standaloneChargesService } from "@/services/api/gestao/standalone-charges.service";

/** Under the customer's keys: charge writes already invalidate them. */
export const customerChargesKey = (customerId: string) =>
  [...queryKeys.customers.all, "charges", customerId] as const;

/** Our charges of the customer (both channels, with or without a rental). */
export function useCustomerCharges(customerId: string) {
  return useQuery({
    queryKey: customerChargesKey(customerId),
    queryFn: () => standaloneChargesService.customerCharges(customerId),
  });
}
