import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { rentalsService } from "@/services/api/gestao/rentals.service";
import type { RentalDetail, RentalStatus } from "@/types/rental";

export function useChangeRentalStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: RentalStatus) =>
      rentalsService.changeStatus(id, status),
    onSuccess: (rental) => {
      // The write answers without documents: keep the ones on screen.
      queryClient.setQueryData<RentalDetail>(
        queryKeys.rentals.detail(id),
        (previous) => ({ ...rental, documents: previous?.documents ?? [] }),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("Situação da locação atualizada");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
