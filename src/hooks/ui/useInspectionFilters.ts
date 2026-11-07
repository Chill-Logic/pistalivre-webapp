import { useMemo } from "react";
import { LABEL_MAPS } from "@/constants/label-maps";
import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { isKnownCode } from "@/helpers/labels";
import { useLabels } from "@/hooks/ui/useLabels";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type {
  InspectionActor,
  InspectionFilters,
  InspectionType,
} from "@/types/inspection";

const KEYS = ["busca", "tipo", "feita_por"] as const;

export function useInspectionFilters() {
  const { values, page, setFilter, setPage } = useUrlFilters(KEYS);
  const { map } = useLabels();
  const typeMap = map(LABEL_MAPS.inspectionType);
  const actorMap = map(LABEL_MAPS.inspectionActor);

  const filters = useMemo<InspectionFilters>(
    () => ({
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      q: values.busca,
      type: isKnownCode(typeMap, values.tipo)
        ? (values.tipo as InspectionType)
        : "",
      performedBy: isKnownCode(actorMap, values.feita_por)
        ? (values.feita_por as InspectionActor)
        : "",
    }),
    [page, values, typeMap, actorMap],
  );

  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setType: (value: string) => setFilter("tipo", value),
    setPerformedBy: (value: string) => setFilter("feita_por", value),
    setPage,
  };
}
