import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { openBlobInNewTab } from "@/helpers/files";
import { partnersService } from "@/services/api/gestao/partners.service";
import type {
  PartnerCalculatorScenario,
  PartnerContract,
  PartnerContractDetail,
  PartnerContractInput,
  PartnerVehicleInput,
  PartnerVehicleUpdate,
} from "@/types/partner";

/**
 * Every contract route answers with the contract (without its partner): it
 * replaces the cached page, keeping the partner, and the partner's page and
 * the lists (contract and vehicle counts) are refetched.
 */
function useApplyContract() {
  const queryClient = useQueryClient();
  return (contract: PartnerContract) => {
    queryClient.setQueryData<PartnerContractDetail>(
      queryKeys.partners.contract(contract.id),
      (current) =>
        current ? { ...contract, partner: current.partner } : current,
    );
    queryClient.invalidateQueries({
      queryKey: queryKeys.partners.all,
      predicate: (query) => query.queryKey[1] !== "contract",
    });
  };
}

/** New contract of a partner (born as a draft). */
export function useCreatePartnerContract(partnerId: string) {
  const apply = useApplyContract();
  return useMutation({
    mutationFn: (input: PartnerContractInput) =>
      partnersService.createContract(partnerId, input),
    onSuccess: (contract) => {
      apply(contract);
      toast.success(`Contrato ${contract.code} criado como rascunho`);
    },
  });
}

/** Terms and situation (the PATCH takes them all, status included). */
export function useUpdatePartnerContract(contractId: string) {
  const apply = useApplyContract();
  return useMutation({
    mutationFn: (input: PartnerContractInput) =>
      partnersService.updateContract(contractId, input),
    onSuccess: apply,
  });
}

export function useDeletePartnerContract(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => partnersService.removeContract(contractId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: queryKeys.partners.contract(contractId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.all });
      toast.success("Contrato excluído");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

/** The contract's vehicles: include, correct/leave, remove (draft only). */
export function usePartnerContractVehicles(contractId: string) {
  const apply = useApplyContract();

  const add = useMutation({
    mutationFn: (input: PartnerVehicleInput) =>
      partnersService.addVehicle(contractId, input),
    onSuccess: (contract) => {
      apply(contract);
      toast.success("Veículo incluído no contrato");
    },
  });

  const update = useMutation({
    mutationFn: ({
      linkId,
      input,
    }: {
      linkId: string;
      input: PartnerVehicleUpdate;
    }) => partnersService.updateVehicle(contractId, linkId, input),
    onSuccess: apply,
  });

  const remove = useMutation({
    mutationFn: (linkId: string) =>
      partnersService.removeVehicle(contractId, linkId),
    onSuccess: (contract) => {
      apply(contract);
      toast.success("Veículo removido do contrato");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return { add, update, remove };
}

/** "Visualizar PDF": the edited text in a new tab, nothing saved. */
export function usePartnerContractDocumentPreview(contractId: string) {
  return useMutation({
    mutationFn: (html: string) =>
      openBlobInNewTab(() => partnersService.previewDocument(contractId, html)),
    onError: (error) =>
      toast.error(
        `Não foi possível gerar a prévia do PDF: ${errorMessage(error)}`,
      ),
  });
}

/** The contract's proposals, its PDF and the lists are read again. */
function useRefreshProposals(contractId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.partners.contractProposals(contractId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.partners.contractDocument(contractId),
    });
  };
}

/**
 * "Enviar proposta ao parceiro": the text becomes the next version (with its
 * PDF). Errors stay with the editor (422: no vehicle, no offered rent).
 */
export function useSendPartnerProposal(contractId: string) {
  const refresh = useRefreshProposals(contractId);
  return useMutation({
    mutationFn: (html: string) => partnersService.propose(contractId, html),
    onSuccess: (version) => {
      refresh();
      toast.success(`Proposta v${version.number} enviada ao parceiro`);
    },
  });
}

/** Takes back the pending version (the partner no longer sees it). */
export function useWithdrawPartnerProposal(contractId: string) {
  const refresh = useRefreshProposals(contractId);
  return useMutation({
    mutationFn: (versionId: string) =>
      partnersService.withdrawProposal(contractId, versionId),
    onSuccess: () => {
      refresh();
      toast.success("Proposta retirada");
    },
    onError: (error) => {
      refresh();
      toast.error(errorMessage(error));
    },
  });
}

/** The accepted version → a signature request in draft (Assinaturas sends it). */
export function useRequestPartnerProposalSignature(contractId: string) {
  const refresh = useRefreshProposals(contractId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) =>
      partnersService.requestProposalSignature(contractId, versionId),
    onSuccess: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: queryKeys.signatures.all });
      toast.success(
        "Pedido de assinatura criado: inclua os signatários da empresa e envie",
      );
    },
    onError: (error) => {
      refresh();
      toast.error(errorMessage(error));
    },
  });
}

/**
 * "Enviar para assinatura" straight (the deal was closed outside): errors stay
 * with the editor (422: no vehicle, no offered rent).
 */
export function useSendPartnerToSignature(contractId: string) {
  const refresh = useRefreshProposals(contractId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => partnersService.sendToSignature(contractId),
    onSuccess: ({ version }) => {
      refresh();
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.contract(contractId) });
      toast.success(`Versão ${version.number} enviada para assinatura`);
    },
  });
}

/** Saves the calculator's scenario quietly (it's a working note, saved as typed). */
export function useSavePartnerCalculator(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scenario: PartnerCalculatorScenario) =>
      partnersService.saveCalculator(contractId, scenario),
    onSuccess: (contract) =>
      queryClient.setQueryData(queryKeys.partners.contract(contractId), contract),
  });
}

