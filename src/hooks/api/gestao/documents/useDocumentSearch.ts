import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { documentsService } from "@/services/api/gestao/documents.service";

/** Minimum length before searching every document. */
const MIN_QUERY = 2;

export function useDocumentSearch(q: string) {
  return useQuery({
    queryKey: queryKeys.documents.search(q),
    queryFn: () => documentsService.search(q),
    enabled: q.trim().length >= MIN_QUERY,
  });
}
