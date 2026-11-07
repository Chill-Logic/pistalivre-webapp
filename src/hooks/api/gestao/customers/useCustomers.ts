import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { customersService } from "@/services/api/gestao/customers.service";
import type { CustomerFilters } from "@/types/customer";

export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: () => customersService.list(filters),
    placeholderData: keepPreviousData,
  });
}
