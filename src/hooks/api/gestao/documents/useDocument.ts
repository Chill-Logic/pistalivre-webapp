import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { documentsService } from "@/services/api/gestao/documents.service";

/** One document by id. */
export function useDocument(id: string) {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => documentsService.get(id),
  });
}
