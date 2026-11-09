import { useMemo } from "react";
import { pickOption } from "@/helpers/select";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { PartnerFilters } from "@/types/partner";

const KEYS = ["busca", "situacao"] as const;
const ACTIVE = ["true", "false"] as const;

export function usePartnerFilters() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } =
    useUrlFilters(KEYS);

  const filters = useMemo<PartnerFilters>(
    () => ({
      page,
      pageSize,
      q: values.busca,
      active: pickOption(ACTIVE, values.situacao),
    }),
    [page, pageSize, values],
  );

  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setActive: (value: string) => setFilter("situacao", value),
    setPage,
    setPageSize,
  };
}
