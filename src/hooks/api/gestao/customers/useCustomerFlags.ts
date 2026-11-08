import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { customerSettingsService } from "@/services/api/gestao/customer-settings.service";
import type { CustomerDetail } from "@/types/customer";
import type { CustomerFlags } from "@/types/customer-settings";

/**
 * "Cliente de teste" (hidden from the list) and "Fora das métricas" (out of
 * delinquency). The answer patches the record in the cache; the lists and
 * the numbers that count the customer refetch.
 */
export function useCustomerFlags(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (flags: Partial<CustomerFlags>) =>
      customerSettingsService.setFlags(customerId, flags),
    onSuccess: (flags) => {
      queryClient.setQueryData<CustomerDetail>(
        queryKeys.customers.detail(customerId),
        (current) => (current ? { ...current, ...flags } : current),
      );
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.customers.all, "list"],
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("Cliente atualizado");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
