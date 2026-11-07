import { useMemo } from "react";
import { LABEL_MAPS } from "@/constants/label-maps";
import { isKnownCode } from "@/helpers/labels";
import { useLabels } from "@/hooks/ui/useLabels";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { MaintenanceFilters, MaintenanceType } from "@/types/maintenance";

const KEYS = ["busca", "tipo"] as const;

export function useMaintenanceFilters() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } =
    useUrlFilters(KEYS);
  const { map } = useLabels();
  const typeMap = map(LABEL_MAPS.maintenanceType);

  const filters = useMemo<MaintenanceFilters>(
    () => ({
      page,
      pageSize,
      q: values.busca,
      type: isKnownCode(typeMap, values.tipo)
        ? (values.tipo as MaintenanceType)
        : "",
    }),
    [page, pageSize, values, typeMap],
  );

  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setType: (value: string) => setFilter("tipo", value),
    setPage,
    setPageSize,
  };
}
