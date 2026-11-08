import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { customersService } from "@/services/api/gestao/customers.service";

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => customersService.get(id),
    // Pickers mount before a customer is chosen.
    enabled: Boolean(id),
  });
}
