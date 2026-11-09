import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { openBlobInNewTab } from "@/helpers/files";
import { partnersService } from "@/services/api/gestao/partners.service";
import type {
  PartnerContract,
  PartnerContractDetail,
  PartnerContractInput,
  PartnerVehicleInput,
  PartnerVehicleUpdate,
} from "@/types/partner";

/**
 * Every contract route answers with the contract (without its partner): it
 * replaces the cached page, keeping the partner, and the partner's page and
 * the lists (contract and moto counts) are refetched.
 */
function useApplyContract() {
  const queryClient = useQueryClient();
  return (contract: PartnerContract) => {
    queryClient.setQueryData<PartnerContractDetail>(
      queryKeys.partners.contract(contract.id),
      (current) => (current ? { ...contract, partner: current.partner } : current),
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

/** The contract's motos: include, correct/leave, remove (draft only). */
export function usePartnerContractVehicles(contractId: string) {
  const apply = useApplyContract();

  const add = useMutation({
    mutationFn: (input: PartnerVehicleInput) =>
      partnersService.addVehicle(contractId, input),
    onSuccess: (contract) => {
      apply(contract);
      toast.success("Moto incluída no contrato");
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
      toast.success("Moto removida do contrato");
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

/** "Gerar PDF e salvar": errors stay with the editor (422 without a moto). */
export function useGeneratePartnerContractDocument(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (html: string) =>
      partnersService.generateDocument(contractId, html),
    onSuccess: (result) => {
      queryClient.setQueryData(
        queryKeys.partners.contractDocument(contractId),
        result,
      );
      toast.success("Contrato em PDF gerado e anexado");
    },
  });
}
