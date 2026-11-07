import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { customersService } from "@/services/api/gestao/customers.service";
import type { CustomerFilters } from "@/types/customer";

export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: () => customersService.list(filters),
    placeholderData: keepPreviousData,
  });
}

/** The list page: pages on the desktop, infinite (10 by 10) on the phone. */
export function useCustomerList(filters: CustomerFilters, isDesktop: boolean) {
  return usePagedList({
    baseKey: queryKeys.customers.all,
    filters,
    fetch: (current) => customersService.list(current),
    isDesktop,
  });
}
