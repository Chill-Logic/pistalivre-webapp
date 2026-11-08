import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { signaturesService } from "@/services/api/gestao/signatures.service";

/** The API's page ceiling: more live requests than this is not expected. */
const LIVE_PAGE_SIZE = 100;

/**
 * Ids of the PDFs that already have a LIVE signature request (draft or
 * sent): they can't take another one, so pickers leave them out.
 */
export function useLiveSignatureDocumentIds() {
  return useQuery({
    queryKey: [...queryKeys.signatures.all, "live-document-ids"],
    queryFn: async () => {
      const pages = await Promise.all(
        (["DRAFT", "SENT"] as const).map((status) =>
          signaturesService.list({
            page: 1,
            pageSize: LIVE_PAGE_SIZE,
            q: "",
            status,
          }),
        ),
      );
      return new Set(
        pages.flatMap((page) =>
          page.items.flatMap((item) =>
            item.document ? [item.document.id] : [],
          ),
        ),
      );
    },
  });
}
