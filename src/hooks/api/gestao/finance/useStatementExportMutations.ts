import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { openBlobInNewTab, saveBlob } from "@/helpers/files";
import { statementExportsService } from "@/services/api/gestao/statement-exports.service";
import type { StatementExportInput } from "@/types/statement-export";
import { pluralize } from "@/utils/text";

/**
 * Generates one spreadsheet per source and downloads what came out. A source
 * that failed comes back in `failures` (the caller shows them).
 */
export function useCreateStatementExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      input,
      key,
    }: {
      input: StatementExportInput;
      key: string;
    }) => {
      const result = await statementExportsService.create(input, key);
      for (const file of result.files) {
        saveBlob(await statementExportsService.download(file.id), file.fileName);
      }
      return result;
    },
    // Even when a download fails the files were saved: the history shows them.
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.finance.statementExports(),
      }),
    onSuccess: ({ files }) => {
      if (files.length > 0) {
        toast.success(
          `${pluralize(files.length, "planilha gerada", "planilhas geradas")} e baixada${files.length > 1 ? "s" : ""}`,
        );
      }
    },
  });
}

/** Downloads a saved spreadsheet again (the same file). */
export function useDownloadStatementExport() {
  return useMutation({
    mutationFn: async (file: { id: string; fileName: string }) =>
      saveBlob(await statementExportsService.download(file.id), file.fileName),
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useDeleteStatementExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: statementExportsService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.finance.statementExports(),
      });
      toast.success("Exportação excluída");
    },
  });
}

/** Opens the bank's official PDF (Inter) for the period in a new tab. */
export function useBankStatementPdf() {
  return useMutation({
    mutationFn: (range: { start: string; end: string }) =>
      openBlobInNewTab(() => statementExportsService.bankPdf(range)),
    onError: (error) => toast.error(errorMessage(error)),
  });
}
