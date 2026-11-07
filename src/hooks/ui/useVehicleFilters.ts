import { useMemo } from "react";
import { LABEL_MAPS } from "@/constants/label-maps";
import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { isKnownCode } from "@/helpers/labels";
import { useLabels } from "@/hooks/ui/useLabels";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { VehicleFilters, VehicleStatus } from "@/types/vehicle";

const KEYS = ["busca", "tipo", "situacao"] as const;

export function useVehicleFilters() {
  const { values, page, setFilter, setPage } = useUrlFilters(KEYS);
  const { map } = useLabels();
  const statusMap = map(LABEL_MAPS.vehicleStatus);

  const filters = useMemo<VehicleFilters>(
    () => ({
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      q: values.busca,
      type: values.tipo,
      status: isKnownCode(statusMap, values.situacao)
        ? (values.situacao as VehicleStatus)
        : "",
    }),
    [page, values, statusMap],
  );

  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setType: (value: string) => setFilter("tipo", value),
    setStatus: (value: string) => setFilter("situacao", value),
    setPage,
  };
}
