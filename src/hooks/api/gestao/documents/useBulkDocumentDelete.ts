import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { documentsService } from "@/services/api/gestao/documents.service";
import type { DocumentFile } from "@/types/document";
import { pluralize } from "@/utils/text";

export type BulkDeleteFailure = { document: DocumentFile; message: string };

/**
 * Deletes several documents, one `DELETE /documents/:id` at a time (the API
 * has no batch route). Goes through all of them; the ones that fail come
 * back with the reason (e.g. 409 under signature). One refresh at the end.
 */
export function useBulkDocumentDelete(invalidate: QueryKey) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [failures, setFailures] = useState<BulkDeleteFailure[]>([]);

  const run = async (documents: DocumentFile[]) => {
    const failed: BulkDeleteFailure[] = [];
    setFailures([]);
    for (const [index, document] of documents.entries()) {
      setProgress({ done: index, total: documents.length });
      try {
        await documentsService.remove(document.id);
      } catch (error) {
        failed.push({ document, message: errorMessage(error) });
      }
    }
    setProgress(null);
    setFailures(failed);
    queryClient.invalidateQueries({ queryKey: invalidate });
    queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });

    const removed = documents.length - failed.length;
    if (removed > 0) {
      toast.success(
        pluralize(removed, "documento excluído", "documentos excluídos"),
      );
    }
    return { removed, failed };
  };

  return {
    run,
    isPending: progress !== null,
    progress,
    failures,
    reset: () => setFailures([]),
  };
}
