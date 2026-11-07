import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { maintenancesService } from "@/services/api/gestao/maintenances.service";

export function useMaintenance(id: string) {
  return useQuery({
    queryKey: queryKeys.maintenances.detail(id),
    queryFn: () => maintenancesService.get(id),
  });
}
