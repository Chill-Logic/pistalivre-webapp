import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { suppliersService } from "@/services/api/gestao/suppliers.service";
import type { SupplierFilters } from "@/types/supplier";

/** The list page: pages on the desktop, infinite (10 by 10) on the phone. */
export function useSupplierList(filters: SupplierFilters, isDesktop: boolean) {
  return usePagedList({
    baseKey: queryKeys.suppliers.all,
    filters,
    fetch: (current) => suppliersService.list(current),
    isDesktop,
  });
}
