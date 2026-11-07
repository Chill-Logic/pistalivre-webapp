import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { suppliersService } from "@/services/api/gestao/suppliers.service";

export function useDeleteSupplier(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => suppliersService.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.suppliers.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      toast.success("Fornecedor excluído");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
