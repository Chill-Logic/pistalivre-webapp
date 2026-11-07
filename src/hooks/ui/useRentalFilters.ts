import { useMemo } from "react";
import { LABEL_MAPS } from "@/constants/label-maps";
import { isKnownCode } from "@/helpers/labels";
import { useLabels } from "@/hooks/ui/useLabels";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { RentalFilters, RentalStatus } from "@/types/rental";

const KEYS = ["busca", "situacao"] as const;

export function useRentalFilters() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } =
    useUrlFilters(KEYS);
  const { map } = useLabels();
  const statusMap = map(LABEL_MAPS.rentalStatus);

  const filters = useMemo<RentalFilters>(
    () => ({
      page,
      pageSize,
      q: values.busca,
      status: isKnownCode(statusMap, values.situacao)
        ? (values.situacao as RentalStatus)
        : "",
    }),
    [page, pageSize, values, statusMap],
  );

  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setStatus: (value: string) => setFilter("situacao", value),
    setPage,
    setPageSize,
  };
}
