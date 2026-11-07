import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { statementService } from "@/services/api/gestao/statement.service";
import type { StatementFilters } from "@/types/statement";

export function useStatement(filters: StatementFilters) {
  return useQuery({
    queryKey: queryKeys.finance.statement(filters),
    queryFn: () => statementService.load(filters),
    placeholderData: keepPreviousData,
  });
}
