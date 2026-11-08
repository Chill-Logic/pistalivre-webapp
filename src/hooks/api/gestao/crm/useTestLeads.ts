import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { crmService } from "@/services/api/gestao/crm.service";
import { pluralize } from "@/utils/text";

/** Under `crm.all`: creating or deleting any lead refreshes the count. */
const testLeadCountKey = [...queryKeys.crm.all, "test-lead-count"] as const;

/** How many sandbox leads exist (for "Apagar leads de teste (n)"). */
export function useTestLeadCount() {
  return useQuery({
    queryKey: testLeadCountKey,
    queryFn: crmService.testLeadCount,
  });
}

/** Deletes EVERY test lead; real leads and the metrics are untouched. */
export function useDeleteTestLeads() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmService.removeTestLeads,
    onSuccess: ({ deleted }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.all });
      toast.success(
        deleted === 0
          ? "Nenhum lead de teste para apagar"
          : pluralize(deleted, "lead de teste apagado", "leads de teste apagados"),
      );
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
