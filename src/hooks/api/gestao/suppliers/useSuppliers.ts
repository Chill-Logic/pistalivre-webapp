import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { suppliersService } from "@/services/api/gestao/suppliers.service";
import type { SupplierFilters } from "@/types/supplier";

export function useSuppliers(filters: SupplierFilters) {
  return useQuery({
    queryKey: queryKeys.suppliers.list(filters),
    queryFn: () => suppliersService.list(filters),
    placeholderData: keepPreviousData,
  });
}
