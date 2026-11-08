import { useQuery } from "@tanstack/react-query";
import { MAX_PAGE_SIZE } from "@/constants/pagination";
import { queryKeys } from "@/constants/query-keys";
import { debtsService } from "@/services/api/gestao/debts.service";

/** The debts attributed to one vehicle (financing, a loan for a repair…). */
export function useVehicleDebts(vehicleId: string) {
  return useQuery({
    queryKey: queryKeys.debts.byVehicle(vehicleId),
    queryFn: () =>
      debtsService.list({ page: 1, pageSize: MAX_PAGE_SIZE, vehicleId }),
    enabled: Boolean(vehicleId),
  });
}
