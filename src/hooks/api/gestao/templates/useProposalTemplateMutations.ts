import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { templatesService } from "@/services/api/gestao/templates.service";
import type { ProposalTemplateInput } from "@/types/template";

/**
 * Refreshes the models list and the composer's active list ("Nova
 * proposta"), which lives under the proposals key.
 */
function useInvalidateProposalTemplates() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.templates.proposals(),
    });
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.proposals.all, "templates"],
    });
  };
}

/** Create (no id) or replace (id) — each save is a new version. */
export function useSaveProposalTemplate(id?: string) {
  const queryClient = useQueryClient();
  const invalidateLists = useInvalidateProposalTemplates();
  return useMutation({
    mutationFn: (input: ProposalTemplateInput) =>
      id
        ? templatesService.updateProposal(id, input)
        : templatesService.createProposal(input),
    onSuccess: (template) => {
      queryClient.setQueryData(
        queryKeys.templates.proposal(template.id),
        template,
      );
      invalidateLists();
      toast.success(
        id
          ? `Modelo salvo (versão ${template.version})`
          : "Modelo de proposta criado",
      );
    },
  });
}

export function useDeleteProposalTemplate(id: string) {
  const queryClient = useQueryClient();
  const invalidateLists = useInvalidateProposalTemplates();
  return useMutation({
    mutationFn: () => templatesService.removeProposal(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.templates.proposal(id) });
      invalidateLists();
      toast.success("Modelo excluído");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
