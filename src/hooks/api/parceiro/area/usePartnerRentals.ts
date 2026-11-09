import { useQueries } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { partnerRentalRows, partnerVehicleRows } from "@/helpers/partner-area";
import { usePartnerHome } from "@/hooks/api/parceiro/area/usePartnerHome";
import { partnerAreaService } from "@/services/api/parceiro/partner-area.service";

/**
 * Every rental the partner may see. The API has no list of them: it comes
 * from each motorcycle's page (same cache as the motorcycle's own page; the
 * partner has few motorcycles). `enabled = false` skips the motorcycles.
 */
export function usePartnerRentals(enabled = true) {
  const home = usePartnerHome();
  const vehicleIds = home.data
    ? partnerVehicleRows(home.data.contracts).map((row) => row.vehicleId)
    : [];

  return useQueries({
    queries: vehicleIds.map((id) => ({
      queryKey: queryKeys.partnerArea.vehicle(id),
      queryFn: () => partnerAreaService.vehicle(id),
      enabled,
    })),
    combine: (results) => {
      const failed = results.find((result) => result.isError);
      const error = home.error ?? failed?.error ?? null;
      const isPending =
        home.isPending || results.some((result) => result.isPending);
      return {
        rentals:
          isPending || error
            ? []
            : partnerRentalRows(results.flatMap((result) => result.data ?? [])),
        isPending: isPending && !error,
        isError: error !== null,
        error,
        isRefetching:
          home.isRefetching || results.some((result) => result.isRefetching),
        refetch: () => {
          void home.refetch();
          results.forEach((result) => void result.refetch());
        },
      };
    },
  });
}
