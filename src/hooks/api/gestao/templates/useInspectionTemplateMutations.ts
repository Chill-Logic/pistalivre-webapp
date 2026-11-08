import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { templatesService } from "@/services/api/gestao/templates.service";
import type {
  InspectionPolicyInput,
  InspectionRequirementInput,
  InspectionRequirements,
} from "@/types/template";

/** Adds an item to a vehicle type (it goes to the end of the list). */
export function useCreateInspectionRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InspectionRequirementInput) =>
      templatesService.createRequirement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.templates.inspection(),
      });
      toast.success("Item adicionado");
    },
  });
}

export function useDeleteInspectionRequirement(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => templatesService.removeRequirement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.templates.inspection(),
      });
      toast.success("Item excluído");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

/** The cadence: answers with the saved policy, written straight to the cache. */
export function useUpdateInspectionPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InspectionPolicyInput) =>
      templatesService.updatePolicy(input),
    onSuccess: (policy) => {
      queryClient.setQueryData<InspectionRequirements>(
        queryKeys.templates.inspection(),
        (current) => (current ? { ...current, policy } : current),
      );
      toast.success("Cadência salva");
    },
  });
}
