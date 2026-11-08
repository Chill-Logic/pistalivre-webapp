import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { portalService } from "@/services/api/cliente/portal.service";
import type { PortalAttachOwner } from "@/types/portal";

/** Kinds of document the renter picks when attaching ("Recibo", "Nota"…). */
export function useMyDocumentCategories(
  ownerType: PortalAttachOwner,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.portal.documentCategories(ownerType),
    queryFn: () => portalService.documentCategories(ownerType),
    staleTime: 10 * 60_000,
    enabled,
  });
}
