import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { rentalsService } from "@/services/api/gestao/rentals.service";
import type { RentalDetail, TerminationInput } from "@/types/rental";

/** The termination preview, refreshed as the date changes (dialog open). */
export function useTerminationPreview(
  id: string,
  date: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: [...queryKeys.rentals.detail(id), "termination-preview", date],
    queryFn: () => rentalsService.terminationPreview(id, date),
    enabled: enabled && Boolean(date),
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

export function useTerminateRental(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: TerminationInput }) =>
      rentalsService.terminate(id, key, input),
    onSuccess: ({ rental }) => {
      // The write answers without documents: keep the ones on screen.
      queryClient.setQueryData<RentalDetail>(
        queryKeys.rentals.detail(id),
        (previous) => ({ ...rental, documents: previous?.documents ?? [] }),
      );
      for (const key of [
        queryKeys.rentals.all,
        queryKeys.vehicles.all,
        queryKeys.customers.all,
        queryKeys.finance.all,
        queryKeys.dashboard.all,
      ]) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}
