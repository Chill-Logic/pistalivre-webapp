import { queryKeys } from "@/constants/query-keys";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { signaturesService } from "@/services/api/gestao/signatures.service";
import type { SignatureFilters } from "@/types/signature";

/** The list page: pages on the desktop, infinite (10 by 10) on the phone. */
export function useSignatureList(
  filters: SignatureFilters,
  isDesktop: boolean,
) {
  return usePagedList({
    baseKey: queryKeys.signatures.all,
    filters,
    fetch: (current) => signaturesService.list(current),
    isDesktop,
  });
}
