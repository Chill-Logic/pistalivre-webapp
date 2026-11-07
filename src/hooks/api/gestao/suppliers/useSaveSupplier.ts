import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { suppliersService } from "@/services/api/gestao/suppliers.service";
import type { SupplierInput } from "@/types/supplier";

/** Create (no id) or update (id). Errors are mapped onto the form fields. */
export function useSaveSupplier(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierInput) =>
      id ? suppliersService.update(id, input) : suppliersService.create(input),
    onSuccess: (supplier) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      queryClient.setQueryData(
        queryKeys.suppliers.detail(supplier.id),
        supplier,
      );
      toast.success(id ? "Fornecedor atualizado" : "Fornecedor cadastrado");
    },
  });
}
