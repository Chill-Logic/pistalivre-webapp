import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { partnersService } from "@/services/api/gestao/partners.service";
import type { PartnerInput } from "@/types/partner";

/** Lists and partner pages (not the contract pages, refreshed apart). */
function invalidatePartners(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.partners.all,
    predicate: (query) => query.queryKey[1] !== "contract",
  });
}

/** Create (no id) or update (id). Errors are mapped onto the form fields. */
export function useSavePartner(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PartnerInput) =>
      id ? partnersService.update(id, input) : partnersService.create(input),
    onSuccess: () => {
      invalidatePartners(queryClient);
      // A contract page shows the partner too.
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.partners.all, "contract"],
      });
      toast.success(id ? "Parceiro atualizado" : "Parceiro cadastrado");
    },
  });
}

export function useDeletePartner(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => partnersService.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.partners.detail(id) });
      invalidatePartners(queryClient);
      toast.success("Parceiro excluído");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

/** Give/reset the partner area password, or take the access away. */
export function usePartnerAccess(id: string) {
  const queryClient = useQueryClient();

  const grant = useMutation({
    mutationFn: (password: string) => partnersService.setAccess(id, password),
    onSuccess: () => invalidatePartners(queryClient),
  });

  const revoke = useMutation({
    mutationFn: () => partnersService.revokeAccess(id),
    onSuccess: () => {
      invalidatePartners(queryClient);
      toast.success("Acesso removido");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return { grant, revoke };
}
