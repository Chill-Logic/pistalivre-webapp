import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { documentsService } from "@/services/api/gestao/documents.service";
import type { DocumentOwnerType } from "@/types/document";

/** Kinds of document an owner type accepts ("CRLV", "Recibo"…). */
export function useDocumentCategories(
  ownerType: DocumentOwnerType,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.documents.categories(ownerType),
    queryFn: () => documentsService.categories(ownerType),
    staleTime: 10 * 60_000,
    enabled,
  });
}
