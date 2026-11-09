import { useMemo } from "react";
import { pickOption } from "@/helpers/select";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { CustomerFilters } from "@/types/customer";

const KEYS = ["busca", "situacao", "teste", "app"] as const;
const STATUSES = ["active", "prospect"] as const;
const TEST_SCOPES = ["test", "all"] as const;
const APP_SCOPES = ["pwa", "browser"] as const;

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
      app: pickOption(APP_SCOPES, values.app),
    }),
    [page, pageSize, values],
  );

  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setStatus: (value: string) => setFilter("situacao", value),
    setTest: (value: string) => setFilter("teste", value),
    setApp: (value: string) => setFilter("app", value),
    setPage,
    setPageSize,
  };
}
