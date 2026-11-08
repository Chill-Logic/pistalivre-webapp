import { useMemo, useState } from "react";
import type { RemoteOption } from "@/components/molecules/remote-combobox";
import { useDocumentSearch } from "@/hooks/api/gestao/documents/useDocumentSearch";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";

/**
 * Our PDFs for a picker (signature requests only take a PDF already
 * attached somewhere). Searches every folder by name, owner or kind.
 */
export function usePdfDocumentOptions() {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search);
  const found = useDocumentSearch(q);
  const options = useMemo<RemoteOption[]>(
    () =>
      (found.data?.results ?? [])
        .filter(
          ({ document }) =>
            document.contentType === "application/pdf" ||
            document.fileName.toLowerCase().endsWith(".pdf"),
        )
        .map(({ document, location }) => ({
          value: document.id,
          label: document.fileName,
          detail: location,
        })),
    [found.data],
  );
  return { search, setSearch, options, isLoading: found.isFetching };
}
