import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { rentalsService } from "@/services/api/gestao/rentals.service";
import type { RentalDetail, RentalInput } from "@/types/rental";

/** Create (no id) or replace (id). Nothing is charged by saving. */
export function useSaveRental(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RentalInput) =>
      id ? rentalsService.update(id, input) : rentalsService.create(input),
    onSuccess: (rental) => {
      // The write answers without documents: keep the ones on screen.
      queryClient.setQueryData<RentalDetail>(
        queryKeys.rentals.detail(rental.id),
        (previous) => ({ ...rental, documents: previous?.documents ?? [] }),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      // Activating moves the vehicle and makes the customer ACTIVE.
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success(id ? "Locação atualizada" : "Locação criada");
    },
  });
}
