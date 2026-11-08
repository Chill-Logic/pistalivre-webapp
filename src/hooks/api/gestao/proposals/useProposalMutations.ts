import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { openBlobInNewTab } from "@/helpers/files";
import { proposalsService } from "@/services/api/gestao/proposals.service";
import type {
  ConvertProposalInput,
  ProposalDetail,
  ProposalDraftInput,
} from "@/types/proposal";

/** A proposal write answers the item: it replaces the cache; lists refetch. */
function useStoreProposal() {
  const queryClient = useQueryClient();
  return (proposal?: ProposalDetail) => {
    if (proposal) {
      queryClient.setQueryData(
        queryKeys.proposals.detail(proposal.id),
        proposal,
      );
    }
    queryClient.invalidateQueries({
      queryKey: queryKeys.proposals.all,
      predicate: (query) => query.queryKey[1] !== "detail",
    });
    // With a lead, the write leaves a note on its trail.
    queryClient.invalidateQueries({ queryKey: queryKeys.crm.all });
  };
}

/** Active templates for "Nova proposta" (step 1). */
export function useProposalTemplates() {
  return useQuery({
    queryKey: [...queryKeys.proposals.all, "templates"],
    queryFn: proposalsService.templates,
    staleTime: 60_000,
  });
}

export function useProposalDraft() {
  return useMutation({
    mutationFn: (input: ProposalDraftInput) => proposalsService.draft(input),
  });
}

export function usePersonalizeProposal() {
  return useMutation({
    mutationFn: ({
      html,
      instructions,
    }: {
      html: string;
      instructions: string;
    }) => proposalsService.personalize(html, instructions),
  });
}

/** Opens the PDF preview in a new tab (opened inside the click). */
export function useProposalPreview() {
  return useMutation({
    mutationFn: (html: string) =>
      openBlobInNewTab(() => proposalsService.preview(html)),
    onError: () => toast.error("Não foi possível gerar a prévia do PDF."),
  });
}

export function useIssueProposal() {
  const store = useStoreProposal();
  return useMutation({
    mutationFn: ({
      input,
      key,
    }: {
      input: ProposalDraftInput & { html: string };
      key: string;
    }) => proposalsService.issue(input, key),
    onSuccess: (proposal) => {
      store(proposal);
      toast.success("Proposta emitida");
    },
  });
}

export function useAcceptProposal(id: string) {
  const store = useStoreProposal();
  return useMutation({
    mutationFn: () => proposalsService.accept(id),
    onSuccess: (proposal) => {
      store(proposal);
      toast.success("Proposta marcada como aceita");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

/** Errors stay with the dialog (422 fields.reason). */
export function useRejectProposal(id: string) {
  const store = useStoreProposal();
  return useMutation({
    mutationFn: (reason: string) => proposalsService.reject(id, reason),
    onSuccess: (proposal) => {
      store(proposal);
      toast.success("Recusa registrada");
    },
  });
}

export function useDeleteProposal(id: string) {
  const queryClient = useQueryClient();
  const store = useStoreProposal();
  return useMutation({
    mutationFn: () => proposalsService.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.proposals.detail(id) });
      store();
      toast.success("Proposta excluída");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useConvertProposal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConvertProposalInput) =>
      proposalsService.convertToLead(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.all });
      toast.success("Lead criado a partir da proposta");
    },
  });
}
