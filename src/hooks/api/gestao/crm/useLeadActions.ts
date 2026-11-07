import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { crmService } from "@/services/api/gestao/crm.service";
import type { LeadDetail, LeadStatus } from "@/types/crm";

/**
 * Writes on one lead. Each answers with the lead's detail, which replaces the
 * cached one; the funnel and the list are refetched (counters change).
 * Dialog-driven writes (notes, loss, reopen) leave errors to the dialog.
 */
export function useLeadActions(id: string) {
  const queryClient = useQueryClient();
  const refresh = (lead: LeadDetail) => {
    queryClient.setQueryData(queryKeys.crm.lead(lead.id), lead);
    queryClient.invalidateQueries({
      queryKey: queryKeys.crm.all,
      predicate: (query) => query.queryKey[1] !== "lead",
    });
  };

  const notes = useMutation({
    mutationFn: (value: string) => crmService.updateNotes(id, value),
    onSuccess: (lead) => {
      refresh(lead);
      toast.success("Observações salvas");
    },
  });

  const status = useMutation({
    mutationFn: (value: LeadStatus) => crmService.changeStatus(id, value),
    onSuccess: (lead) => {
      refresh(lead);
      toast.success("Estágio atualizado");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const lost = useMutation({
    mutationFn: (input: { reasons: string[]; note: string | null }) =>
      crmService.markLost(id, input.reasons, input.note),
    onSuccess: (lead) => {
      refresh(lead);
      toast.success("Lead marcado como perdido");
    },
  });

  /** Resolves with the COPY; the original is refetched (it joins the chain). */
  const reopen = useMutation({
    mutationFn: (reason: string) => crmService.reopen(id, reason),
    onSuccess: (copy) => {
      queryClient.setQueryData(queryKeys.crm.lead(copy.id), copy);
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.all });
      toast.success("Lead retomado em uma nova tentativa");
    },
  });

  const questionnaire = useMutation({
    mutationFn: () => crmService.questionnaire(id),
    onSuccess: (lead) => {
      refresh(lead);
      toast.success("Link do questionário pronto");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: () => crmService.removeLead(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.crm.lead(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.all });
      toast.success("Lead excluído");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return { notes, status, lost, reopen, questionnaire, remove };
}
