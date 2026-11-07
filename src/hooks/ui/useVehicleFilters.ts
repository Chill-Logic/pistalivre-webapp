import { useMemo } from "react";
import { LABEL_MAPS } from "@/constants/label-maps";
import { isKnownCode } from "@/helpers/labels";
import { useLabels } from "@/hooks/ui/useLabels";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { VehicleFilters, VehicleStatus } from "@/types/vehicle";

const KEYS = ["busca", "tipo", "situacao"] as const;

export function useVehicleFilters() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } =
    useUrlFilters(KEYS);
  const { map } = useLabels();
  const statusMap = map(LABEL_MAPS.vehicleStatus);

  const filters = useMemo<VehicleFilters>(
    () => ({
      page,
      pageSize,
      q: values.busca,
      type: values.tipo,
      status: isKnownCode(statusMap, values.situacao)
        ? (values.situacao as VehicleStatus)
        : "",
    }),
    [page, pageSize, values, statusMap],
  );

  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setType: (value: string) => setFilter("tipo", value),
    setStatus: (value: string) => setFilter("situacao", value),
    setPage,
    setPageSize,
  };
}
