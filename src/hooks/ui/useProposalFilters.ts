import { useMemo } from "react";
import { pickOption } from "@/helpers/select";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import { PROPOSAL_STATUSES } from "@/constants/proposal";
import type { ProposalFilters } from "@/types/proposal";

const KEYS = ["busca", "situacao"] as const;

export function useProposalFilters() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } =
    useUrlFilters(KEYS);

  const filters = useMemo<ProposalFilters>(
    () => ({
      page,
      pageSize,
      q: values.busca,
      status: pickOption(PROPOSAL_STATUSES, values.situacao),
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
