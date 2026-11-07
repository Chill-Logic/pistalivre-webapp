import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage } from "@/helpers/api-error";
import { openBlobInNewTab, saveBlob } from "@/helpers/files";
import { filesService } from "@/services/api/files.service";
import type { DocumentFile } from "@/types/document";

/** View/download for authenticated files, with feedback on failure. */
export function useFileActions() {
  const view = useMutation({
    mutationFn: (file: DocumentFile) =>
      openBlobInNewTab(() => filesService.download(file.url)),
    onError: (error) => toast.error(errorMessage(error)),
  });

  const download = useMutation({
    mutationFn: async (file: DocumentFile) =>
      saveBlob(await filesService.download(file.url), file.fileName),
    onError: (error) => toast.error(errorMessage(error)),
  });

  return { view, download };
}
