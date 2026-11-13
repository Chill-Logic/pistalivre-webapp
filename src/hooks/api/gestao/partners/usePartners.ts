import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { partnersService } from "@/services/api/gestao/partners.service";
import type { PartnerContractInput, PartnerFilters } from "@/types/partner";

/** The list page: pages on the desktop, infinite (10 by 10) on the phone. */
export function usePartnerList(filters: PartnerFilters, isDesktop: boolean) {
  return usePagedList({
    baseKey: queryKeys.partners.all,
    filters,
    fetch: (current) => partnersService.list(current),
    isDesktop,
  });
}

/** One partner with its contracts (and their vehicles). */
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

/** The versions of the proposal (and whether the accepted one still holds). */
export function usePartnerContractProposals(id: string) {
  return useQuery({
    queryKey: queryKeys.partners.contractProposals(id),
    queryFn: () => partnersService.proposals(id),
    enabled: Boolean(id),
  });
}

/**
 * The contract's living text, opened once per visit: after that the editor
 * keeps it in step (autosave + realtime), so this query never refetches.
 */
export function usePartnerContractTextDraft(id: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.partners.contractTextDraft(id),
    queryFn: () => partnersService.textDraft(id),
    enabled: enabled && Boolean(id),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
}

/**
 * The contract text for terms not saved yet ("Novo contrato" › Contrato).
 * The caller debounces `input`; the last text stays while the next loads.
 */
export function usePartnerContractTextPreview(
  partnerId: string,
  input: PartnerContractInput | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.partners.contractTextPreview(partnerId, input),
    queryFn: () => partnersService.contractTextPreview(partnerId, input as PartnerContractInput),
    enabled: enabled && Boolean(partnerId) && input !== null,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
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

/** One contract with its vehicles and its partner. */
export function usePartnerContract(id: string) {
  return useQuery({
    queryKey: queryKeys.partners.contract(id),
    queryFn: () => partnersService.getContract(id),
    enabled: Boolean(id),
  });
}
