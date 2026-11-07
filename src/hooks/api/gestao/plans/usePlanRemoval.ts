import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { plansService } from "@/services/api/gestao/plans.service";
import { toPlanInput } from "@/helpers/plan";
import type { Plan } from "@/types/plan";

/**
 * Deleting drops the reference of every lead that chose the plan; deactivating
 * only takes it off the questionnaire. Both live here so the dialog offers them
 * side by side.
 */
export function usePlanRemoval(plan: Plan) {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });

  const deactivate = useMutation({
    // PUT replaces the plan: resend everything, flipping only `active`.
    mutationFn: () =>
      plansService.update(plan.id, { ...toPlanInput(plan), active: false }),
    onSuccess: () => {
      refresh();
      toast.success("Plano desativado");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: () => plansService.remove(plan.id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.plans.detail(plan.id) });
      refresh();
      toast.success("Plano excluído");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return { deactivate, remove };
}
