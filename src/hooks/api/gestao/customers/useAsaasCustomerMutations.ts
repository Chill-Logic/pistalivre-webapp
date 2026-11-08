import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { customersService } from "@/services/api/gestao/customers.service";

/** Links a customer to the same CPF in Asaas (list, detail and directory refetch). */
export function useLinkAsaasCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { customerId: string; asaasCustomerId: string }) =>
      customersService.linkAsaas(input.customerId, input.asaasCustomerId),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success(`${customer.name} vinculado ao Asaas`);
    },
  });
}

/** Imports an "only in Asaas" customer as a linked stub (to complete next). */
export function useImportAsaasCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asaasCustomerId: string) =>
      customersService.importFromAsaas(asaasCustomerId),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success(`${customer.name} importado do Asaas`, {
        description: "Complete o cadastro.",
      });
    },
  });
}
