import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { portalService } from "@/services/api/cliente/portal.service";

export function useMyInvoices() {
  return useQuery({
    queryKey: queryKeys.portal.invoices(),
    queryFn: portalService.invoices,
  });
}
