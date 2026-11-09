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

/** The contract's PDF, if it was generated. */
export function usePartnerContractDocument(id: string) {
  return useQuery({
    queryKey: queryKeys.partners.contractDocument(id),
    queryFn: () => partnersService.getDocument(id),
    enabled: Boolean(id),
  });
}

/** The editor's starting text: read once per visit (the person edits it). */
export function usePartnerContractDocumentDraft(id: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.partners.contractDocumentDraft(id),
    queryFn: () => partnersService.documentDraft(id),
    enabled: enabled && Boolean(id),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
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
