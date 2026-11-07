import { useMemo } from "react";
import { LABEL_MAPS } from "@/constants/label-maps";
import { isKnownCode } from "@/helpers/labels";
import { pickOption } from "@/helpers/select";
import { useLabels } from "@/hooks/ui/useLabels";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { LeadFilters, LeadStatus } from "@/types/crm";

const KEYS = ["busca", "estagio", "teste"] as const;
const TEST_SCOPES = ["test", "all"] as const;

export function useLeadFilters() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } =
    useUrlFilters(KEYS);
  const { map } = useLabels();
  const statusMap = map(LABEL_MAPS.leadStatus);

  const filters = useMemo<LeadFilters>(
    () => ({
      page,
      pageSize,
      q: values.busca,
      status: isKnownCode(statusMap, values.estagio)
        ? (values.estagio as LeadStatus)
        : "",
      test: pickOption(TEST_SCOPES, values.teste),
    }),
    [page, pageSize, values, statusMap],
  );

  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setStatus: (value: string) => setFilter("estagio", value),
    setTest: (value: string) => setFilter("teste", value),
    setPage,
    setPageSize,
  };
}
