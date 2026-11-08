import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { statementService } from "@/services/api/gestao/statement.service";
import type { StatementAnnotationInput } from "@/types/statement";

/**
 * Saves our note / internal mark of a statement line. The totals change
 * with the internal mark, so every statement page is refetched.
 */
export function useAnnotateStatementLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StatementAnnotationInput) =>
      statementService.annotate(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.finance.all, "statement"],
      });
      toast.success("Lançamento atualizado");
    },
  });
}
