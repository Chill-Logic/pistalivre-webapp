import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { customersService } from "@/services/api/gestao/customers.service";

/**
 * Who is only in Asaas, who can be linked by CPF and the CPFs on both sides.
 * Loads apart from the list (Asaas is slower) and never breaks it.
 */
export function useAsaasDirectory() {
  return useQuery({
    queryKey: queryKeys.customers.asaasDirectory(),
    queryFn: () => customersService.asaasDirectory(),
    staleTime: 60_000,
  });
}
