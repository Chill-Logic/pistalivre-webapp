import { useMemo } from "react";
import { pickOption } from "@/helpers/select";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { CustomerFilters } from "@/types/customer";

const KEYS = ["busca", "situacao", "teste"] as const;
const STATUSES = ["active", "prospect"] as const;
const TEST_SCOPES = ["test", "all"] as const;

export function useCustomerFilters() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } =
    useUrlFilters(KEYS);

  const filters = useMemo<CustomerFilters>(
    () => ({
      page,
      pageSize,
      q: values.busca,
      status: pickOption(STATUSES, values.situacao),
      test: pickOption(TEST_SCOPES, values.teste),
    }),
    [page, pageSize, values],
  );

  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setStatus: (value: string) => setFilter("situacao", value),
    setTest: (value: string) => setFilter("teste", value),
    setPage,
    setPageSize,
  };
}
