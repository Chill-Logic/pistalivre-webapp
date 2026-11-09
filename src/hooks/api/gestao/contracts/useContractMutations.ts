import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage, toApiError } from "@/helpers/api-error";
import { rentalContractsKey } from "@/helpers/contract";
import { openBlobInNewTab } from "@/helpers/files";
import { contractsService } from "@/services/api/gestao/contracts.service";

/** A contract write changes the rental's contracts AND its documents (the PDF). */
function useRefreshRentalContracts() {
  const queryClient = useQueryClient();
  return (rentalId: string) => {
    queryClient.invalidateQueries({ queryKey: rentalContractsKey(rentalId) });
    queryClient.invalidateQueries({
      queryKey: queryKeys.rentals.detail(rentalId),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
  };
}

export function usePersonalizeContract() {
  return useMutation({
    mutationFn: ({
      html,
      instructions,
      rentalId,
    }: {
      html: string;
      instructions: string;
      rentalId: string;
    }) => contractsService.personalize(html, instructions, rentalId),
  });
}

/** Opens the PDF preview in a new tab (opened inside the click). */
export function useContractPreview() {
  return useMutation({
    mutationFn: (input: {
      rentalId: string;
      templateId: string;
      html: string;
    }) => openBlobInNewTab(() => contractsService.preview(input)),
    onError: (error) =>
      toast.error(
        `Não foi possível gerar a prévia do PDF: ${errorMessage(error)}`,
      ),
  });
}

/** Errors stay with the editor (422 fields.cnh, 409 retroactive). */
export function useCreateContract(rentalId: string) {
  const refresh = useRefreshRentalContracts();
  return useMutation({
    mutationFn: ({
      input,
      key,
    }: {
      input: { templateId: string; html: string };
      key: string;
    }) => contractsService.create(rentalId, input, key),
    onSuccess: () => {
      refresh(rentalId);
      toast.success("Contrato gerado e anexado à locação");
    },
  });
}

export function useDeleteContract(rentalId: string) {
  const refresh = useRefreshRentalContracts();
  return useMutation({
    mutationFn: (id: string) => contractsService.remove(id),
    onSuccess: () => {
      refresh(rentalId);
      toast.success("Contrato excluído");
    },
    onError: (error) =>
      toast.error(
        toApiError(error).status === 409
          ? "Este contrato está num pedido de assinatura. Exclua o pedido em Assinaturas antes de excluir o contrato."
          : errorMessage(error),
      ),
  });
}
