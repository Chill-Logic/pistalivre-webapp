import { useMemo } from "react";
import { pickOption } from "@/helpers/select";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import { SIGNATURE_STATUSES } from "@/constants/signature";
import type { SignatureFilters } from "@/types/signature";

const KEYS = ["busca", "situacao"] as const;

export function useSignatureFilters() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } =
    useUrlFilters(KEYS);

  const filters = useMemo<SignatureFilters>(
    () => ({
      page,
      pageSize,
      q: values.busca,
      status: pickOption(SIGNATURE_STATUSES, values.situacao),
    }),
    [page, pageSize, values],
  );

  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setStatus: (value: string) => setFilter("situacao", value),
    setPage,
    setPageSize,
  };
}
