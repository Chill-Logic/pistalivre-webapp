import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { dashboardService } from "@/services/api/gestao/dashboard.service";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: dashboardService.get,
  });
}
