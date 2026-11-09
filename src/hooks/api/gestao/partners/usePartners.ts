import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { partnersService } from "@/services/api/gestao/partners.service";
import type { PartnerFilters } from "@/types/partner";

/** The list page: pages on the desktop, infinite (10 by 10) on the phone. */
export function usePartnerList(filters: PartnerFilters, isDesktop: boolean) {
  return usePagedList({
    baseKey: queryKeys.partners.all,
    filters,
    fetch: (current) => partnersService.list(current),
    isDesktop,
  });
}

/** One partner with its contracts (and their motos). */
export function usePartner(id: string) {
  return useQuery({
    queryKey: queryKeys.partners.detail(id),
    queryFn: () => partnersService.get(id),
    enabled: Boolean(id),
  });
}

/** One contract with its motos and its partner. */
export function usePartnerContract(id: string) {
  return useQuery({
    queryKey: queryKeys.partners.contract(id),
    queryFn: () => partnersService.getContract(id),
    enabled: Boolean(id),
  });
}
