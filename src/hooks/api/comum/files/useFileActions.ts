import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage } from "@/helpers/api-error";
import { openBlobInNewTab, saveBlob } from "@/helpers/files";
import { filesService } from "@/services/api/comum/files.service";
import type { DocumentAttachment } from "@/types/document";

/** View/download for authenticated files, with feedback on failure. */
export function useFileActions() {
  const view = useMutation({
    mutationFn: (file: DocumentAttachment) =>
      openBlobInNewTab(() => filesService.download(file.url)),
    onError: (error) => toast.error(errorMessage(error)),
  });

  const download = useMutation({
    mutationFn: async (file: DocumentAttachment) =>
      saveBlob(await filesService.download(file.url), file.fileName),
    onError: (error) => toast.error(errorMessage(error)),
  });

  return { view, download };
}
