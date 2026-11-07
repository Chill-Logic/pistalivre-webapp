import { useUrlFilters } from "@/hooks/ui/useUrlFilters";

const KEYS = ["pasta", "busca"] as const;

/** Current folder and search live in the URL (back/refresh keep them). */
export function useDocumentBrowser() {
  const { values, setFilter, setFilters } = useUrlFilters(KEYS);
  return {
    path: values.pasta,
    query: values.busca,
    openFolder: (path: string) => setFilters({ pasta: path, busca: "" }),
    setQuery: (value: string) => setFilter("busca", value),
  };
}
