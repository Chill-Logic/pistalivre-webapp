import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { reconciliationService } from "@/services/api/gestao/reconciliation.service";
import type { ReconciliationView } from "@/types/reconciliation";

/** Suggestions of the Financeiro; a pix landing (bank.updated) refreshes them live. */
export function useReconciliationSuggestions() {
  return useQuery({
    queryKey: queryKeys.finance.reconciliation(),
    queryFn: () => reconciliationService.suggestions(),
    staleTime: 60_000,
  });
}

/**
 * Dismiss a suggestion (or the whole pix). Optimistic: the line moves on at
 * once (to the next target, or away); a failure puts it back.
 */
export function useDismissReconciliation() {
  const queryClient = useQueryClient();
  const key = queryKeys.finance.reconciliation();
  return useMutation({
    mutationFn: ({ bankKey, targetKey }: { bankKey: string; targetKey: string }) =>
      reconciliationService.dismiss(bankKey, targetKey),
    onMutate: async ({ bankKey, targetKey }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ReconciliationView>(key);
      if (previous) {
        queryClient.setQueryData<ReconciliationView>(key, {
          ...previous,
          suggestions: previous.suggestions
            .filter((s) => !(s.credit.key === bankKey && targetKey === "line"))
            .map((s) =>
              s.credit.key === bankKey ? { ...s, targets: s.targets.filter((t) => t.key !== targetKey) } : s,
            )
            .filter((s) => s.targets.length > 0),
        });
      }
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error("Não foi possível dispensar a sugestão");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
