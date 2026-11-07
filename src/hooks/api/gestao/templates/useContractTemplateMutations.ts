import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { templatesService } from "@/services/api/gestao/templates.service";
import type { ContractTemplateInput } from "@/types/template";

/** Create (no id) or replace (id) — each save is a new version. */
export function useSaveContractTemplate(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ContractTemplateInput) =>
      id
        ? templatesService.updateContract(id, input)
        : templatesService.createContract(input),
    onSuccess: (template) => {
      queryClient.setQueryData(
        queryKeys.templates.contract(template.id),
        template,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.templates.contracts(),
      });
      toast.success(
        id
          ? `Modelo salvo (versão ${template.version})`
          : "Modelo de contrato criado",
      );
    },
  });
}

export function useDeleteContractTemplate(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => templatesService.removeContract(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.templates.contract(id) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.templates.contracts(),
      });
      toast.success("Modelo excluído");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
