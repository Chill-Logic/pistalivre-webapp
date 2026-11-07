import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { rentalsService } from "@/services/api/gestao/rentals.service";
import type { RentalStatus } from "@/types/rental";

export function useChangeRentalStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: RentalStatus) =>
      rentalsService.changeStatus(id, status),
    onSuccess: (rental) => {
      queryClient.setQueryData(queryKeys.rentals.detail(id), rental);
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("Situação da locação atualizada");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
