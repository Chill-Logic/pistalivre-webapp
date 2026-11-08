import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { standaloneChargesService } from "@/services/api/gestao/standalone-charges.service";

/** Under the customer's keys: charge writes already invalidate them. */
export function useAsaasCharges(customerId: string) {
  return useQuery({
    queryKey: [...queryKeys.customers.all, "asaas-charges", customerId],
    queryFn: () => standaloneChargesService.asaasCharges(customerId),
  });
}
