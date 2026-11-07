import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { documentsService } from "@/services/api/gestao/documents.service";
import type { DocumentOwner, DocumentUpdateInput } from "@/types/document";

export type UploadItem = { file: File; categoryId?: string };

/**
 * Upload / edit / delete documents of one owner. `invalidate` is the query
 * that shows them (e.g. the vehicle detail), refreshed after each change.
 */
export function useDocumentMutations(
  owner: DocumentOwner,
  invalidate: QueryKey,
) {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: invalidate });
    queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
  };

  const upload = useMutation({
    mutationFn: (item: UploadItem) =>
      documentsService.upload(owner, item.file, item.categoryId),
    onSuccess: refresh,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: DocumentUpdateInput }) =>
      documentsService.update(id, input),
    onSuccess: () => {
      refresh();
      toast.success("Documento atualizado");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => documentsService.remove(id),
    onSuccess: () => {
      refresh();
      toast.success("Documento excluído");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return { upload, update, remove };
}
