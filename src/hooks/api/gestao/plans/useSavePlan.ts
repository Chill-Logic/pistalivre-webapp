import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { plansService } from "@/services/api/gestao/plans.service";
import type { PlanInput } from "@/types/plan";

/** Create (no id) or update (id). Errors are mapped onto the form fields. */
export function useSavePlan(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlanInput) =>
      id ? plansService.update(id, input) : plansService.create(input),
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
      queryClient.setQueryData(queryKeys.plans.detail(plan.id), plan);
      toast.success(id ? "Plano atualizado" : "Plano cadastrado");
    },
  });
}
