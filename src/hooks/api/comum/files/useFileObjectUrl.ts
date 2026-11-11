import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { useObjectUrl } from "@/hooks/ui/useObjectUrl";
import { filesService } from "@/services/api/comum/files.service";
import type { FileLink } from "@/types/document";

/**
 * An image `src` for an authenticated file (the API needs the bearer header,
 * so the browser cannot load the path directly). The bytes are cached by
 * URL: the thumbnail, the carousel and the full screen share one download.
 */
export function useFileObjectUrl(file: FileLink | null | undefined) {
  const blob = useQuery({
    queryKey: queryKeys.fileBlob(file?.url ?? ""),
    queryFn: () => filesService.download(file?.url ?? ""),
    enabled: Boolean(file),
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
  const url = useObjectUrl(blob.data);

  return {
    url,
    isPending: Boolean(file) && (blob.isPending || (!url && !blob.isError)),
    isError: blob.isError,
  };
}
