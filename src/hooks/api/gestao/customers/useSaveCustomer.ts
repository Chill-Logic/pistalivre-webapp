import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { customersService } from "@/services/api/gestao/customers.service";
import type { CustomerInput } from "@/types/customer-input";

/** Create (no id) or update (id). Errors are mapped onto the form fields. */
export function useSaveCustomer(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerInput) =>
      id ? customersService.update(id, input) : customersService.create(input),
    onSuccess: ({ asaas }) => {
      // The response has no rentals/documents: refetch the detail instead of
      // seeding it, or the page would render half a customer.
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.all });
      toast.success(id ? "Cliente atualizado" : "Cliente cadastrado");
      if (!asaas.synced) {
        // Saved here anyway; only the Asaas copy is behind.
        toast.warning(`Salvo, mas o Asaas não foi atualizado: ${asaas.error}`, {
          duration: 10_000,
        });
      }
    },
  });
}
