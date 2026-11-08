import { useQuery } from "@tanstack/react-query";
import { contractDraftKey, rentalContractsKey } from "@/helpers/contract";
import { contractsService } from "@/services/api/gestao/contracts.service";

/** The contracts generated for a rental, newest first. */
export function useRentalContracts(rentalId: string) {
  return useQuery({
    queryKey: rentalContractsKey(rentalId),
    queryFn: () => contractsService.list(rentalId),
    enabled: Boolean(rentalId),
  });
}

/**
 * The template merged with the rental, for the editor. Read once: a refetch
 * would not reach the editor anyway (it seeds once) and would only repeat
 * the 422/409 checks. `enabled` = false while the CNH form is open.
 */
export function useContractDraft(
  rentalId: string,
  templateId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: contractDraftKey(rentalId, templateId),
    queryFn: () => contractsService.draft(rentalId, templateId),
    enabled: enabled && Boolean(rentalId && templateId),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
}
