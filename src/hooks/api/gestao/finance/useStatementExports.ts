import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { statementExportsService } from "@/services/api/gestao/statement-exports.service";

/** Saved statement spreadsheets (the last 50). */
export function useStatementExports() {
  return useQuery({
    queryKey: queryKeys.finance.statementExports(),
    queryFn: statementExportsService.list,
  });
}
