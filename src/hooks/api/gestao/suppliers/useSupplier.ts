import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { suppliersService } from "@/services/api/gestao/suppliers.service";

export function useSupplier(id: string) {
  return useQuery({
    queryKey: queryKeys.suppliers.detail(id),
    queryFn: () => suppliersService.get(id),
  });
}
