import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { MAX_PAGE_SIZE } from "@/constants/pagination";
import { signaturesService } from "@/services/api/gestao/signatures.service";
import type { SignatureFilters } from "@/types/signature";

type SignatureOwner = Required<Pick<SignatureFilters, "ownerType" | "ownerId">>;

/**
 * Signature requests over the PDFs of one customer or rental, newest first.
 * Under `signatures.all`, so every signature write refreshes it.
 */
export function useOwnerSignatures({ ownerType, ownerId }: SignatureOwner) {
  const filters: SignatureFilters = {
    page: 1,
    pageSize: MAX_PAGE_SIZE,
    q: "",
    status: "",
    ownerType,
    ownerId,
  };
  return useQuery({
    queryKey: [...queryKeys.signatures.all, "owner", filters],
    queryFn: () => signaturesService.list(filters),
  });
}
