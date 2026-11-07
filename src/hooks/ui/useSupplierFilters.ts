import { useMemo } from "react";
import { pickOption } from "@/helpers/select";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { SupplierFilters } from "@/types/supplier";

const KEYS = ["busca", "escopo", "situacao"] as const;
const SCOPES = ["COMPANY", "VEHICLE"] as const;
const ACTIVE = ["true", "false"] as const;

export function useSupplierFilters() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } =
    useUrlFilters(KEYS);

  const filters = useMemo<SupplierFilters>(
    () => ({
      page,
      pageSize,
      q: values.busca,
      scope: pickOption(SCOPES, values.escopo),
      active: pickOption(ACTIVE, values.situacao),
    }),
    [page, pageSize, values],
  );

  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setScope: (value: string) => setFilter("escopo", value),
    setActive: (value: string) => setFilter("situacao", value),
    setPage,
    setPageSize,
  };
}
