import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { rentalsService } from "@/services/api/gestao/rentals.service";

export function useDeleteRental(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => rentalsService.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.rentals.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      toast.success("Locação excluída");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
