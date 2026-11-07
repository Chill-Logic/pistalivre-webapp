import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { documentsService } from "@/services/api/gestao/documents.service";

export function useDocumentTree(path: string) {
  return useQuery({
    queryKey: queryKeys.documents.tree(path),
    queryFn: () => documentsService.tree(path),
    placeholderData: keepPreviousData,
  });
}
