import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { openBlobInNewTab } from "@/helpers/files";
import { partnerAreaService } from "@/services/api/parceiro/partner-area.service";

type VersionRef = { contractId: string; versionId: string };

/** Opens the PDF of a proposal's version (Bearer → blob) in a new tab. */
export function usePartnerProposalDocument() {
  return useMutation({
    mutationFn: ({ contractId, versionId }: VersionRef) =>
      openBlobInNewTab(() =>
        partnerAreaService.proposalDocument(contractId, versionId),
      ),
    onError: (error) => toast.error(errorMessage(error)),
  });
}

/**
 * Accept / refuse the pending version. Either way the home is read again:
 * after a 422 ("foi alterada pela locadora", "já foi decidida") it shows
 * what the version is now. The caller shows the error.
 */
export function usePartnerProposalDecision() {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.partnerArea.home() });

  const accept = useMutation({
    mutationFn: ({ contractId, versionId }: VersionRef) =>
      partnerAreaService.acceptProposal(contractId, versionId),
    onSuccess: () => {
      toast.success("Proposta aceita: a locadora prepara a assinatura");
    },
    onSettled: refresh,
  });

  const reject = useMutation({
    mutationFn: ({
      contractId,
      versionId,
      note,
    }: VersionRef & { note: string }) =>
      partnerAreaService.rejectProposal(contractId, versionId, note),
    onSuccess: () => {
      toast.success("Proposta recusada: a locadora recebe o seu motivo");
    },
    onSettled: refresh,
  });

  return { accept, reject };
}
