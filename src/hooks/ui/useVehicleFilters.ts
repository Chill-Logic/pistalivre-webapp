import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { VEHICLE_STATUS_LABELS } from "@/constants/labels";
import { parsePage } from "@/helpers/pagination";
import type { VehicleFilters, VehicleStatus } from "@/types/vehicle";

const PAGE_SIZE = 20;

function parseStatus(value: string | null): VehicleStatus | "" {
  return value && value in VEHICLE_STATUS_LABELS
    ? (value as VehicleStatus)
    : "";
}

/**
 * Vehicle list filters live in the URL: shareable, survive refresh and the
 * back button. Any filter change goes back to page 1.
 */
export function useVehicleFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<VehicleFilters>(
    () => ({
      page: parsePage(params.get("pagina")),
      pageSize: PAGE_SIZE,
      q: params.get("busca") ?? "",
      type: params.get("tipo") ?? "",
      status: parseStatus(params.get("situacao")),
    }),
    [params],
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value) next.set(key, value);
          else next.delete(key);
          if (key !== "pagina") next.delete("pagina");
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return {
    filters,
    setSearch: (value: string) => setParam("busca", value),
    setType: (value: string) => setParam("tipo", value),
    setStatus: (value: string) => setParam("situacao", value),
    setPage: (page: number) => setParam("pagina", page > 1 ? String(page) : ""),
  };
}
