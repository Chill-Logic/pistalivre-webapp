import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { customersService } from "@/services/api/gestao/customers.service";

export function useDeleteCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => customersService.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.customers.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success("Cliente excluído");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
